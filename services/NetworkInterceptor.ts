// NetworkInterceptor.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiUrl } from "../src/app-env.config";
import { AxiosStatic } from "axios";
import { SyncManager } from "../src/offline/SyncManager";
import { OfflineQueue } from "../src/offline/OfflineQueue";

const WRITE_METHODS = ["post", "put", "delete", "patch"];

const BASE_URL = apiUrl;

// Create an instance of axios to use interceptors
const axiosInstance: AxiosStatic = axios.create({
  baseURL: BASE_URL,
}) as AxiosStatic;

const CancelToken = axios.CancelToken;

axiosInstance.CancelToken = CancelToken;
axiosInstance.isCancel = axios.isCancel;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractMessage = (error: any): string => {
  if (typeof error.response?.data === "string") return error.response.data;
  return error.message ?? error.response?.data?.error;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractError(error: any) {
  if (!error) error = new Error();
  if (!error.response) error.response = {};
  error.message = extractMessage(error);
  return error;
}

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Removed the type annotation here
    try {
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem("@token");

      // Add the Authorization header if a token is available
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Check if offline for write operations (excluding smart settlement)
      const method = config.method?.toLowerCase() || "";
      const isWrite = WRITE_METHODS.includes(method);
      const isSmartSettle = config.url?.includes(
        "/api/expenses/bulk-settle-untagged",
      );

      if (isWrite && !isSmartSettle) {
        const isOnline = await SyncManager.isOnline();
        if (!isOnline) {
          // Queue the request for later sync
          const description = buildDescription(config);
          await OfflineQueue.enqueue({
            url: config.url || "",
            method: config.method?.toUpperCase() as
              | "POST"
              | "PUT"
              | "DELETE"
              | "PATCH",
            data: config.data,
            description,
          });

          // Return a fake success response so the UI flow continues
          const fakeResponse = {
            data: { ...config.data, _offlineQueued: true },
            status: 200,
            statusText: "Queued Offline",
            headers: {},
            config,
          };

          // Cancel the actual request
          return Promise.reject({
            __OFFLINE_QUEUED__: true,
            response: fakeResponse,
          });
        }
      }

      return config;
    } catch (error) {
      const extractedError = extractError(error);
      return Promise.reject(extractedError);
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  (error) => {
    // Handle the offline queue case — return the fake response as success
    if (error.__OFFLINE_QUEUED__) {
      return error.response;
    }

    // If the response is an error, add a custom message property
    error = extractError(error);
    // Return the modified error object
    return Promise.reject(error);
  },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildDescription(config: any): string {
  const url = config.url || "";
  const method = config.method?.toUpperCase() || "?";

  if (url.includes("/api/works")) return `${method} Work`;
  if (url.includes("/api/expenses")) return `${method} Expense`;
  if (url.includes("/api/contributions")) return `${method} Contribution`;
  if (url.includes("/api/sales")) return `${method} Sale`;
  return `${method} ${url}`;
}

export default axiosInstance;
