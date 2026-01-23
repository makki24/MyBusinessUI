// NetworkInterceptor.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiUrl } from "../src/app-env.config";
import { AxiosStatic } from "axios";

const BASE_URL = apiUrl;

// Create an instance of axios to use interceptors
const axiosInstance: AxiosStatic = axios.create({
  baseURL: BASE_URL,
}) as AxiosStatic;

const CancelToken = axios.CancelToken;

axiosInstance.CancelToken = CancelToken;
axiosInstance.isCancel = axios.isCancel;

const extractMessage = (error): string => {
  if (typeof error.response?.data === "string") return error.response.data;
  return error.message ?? error.response?.data?.error;
};

function extractError(error) {
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
    // If the response is an error, add a custom message property
    error = extractError(error);
    // Return the modified error object
    return Promise.reject(error);
  },
);

export default axiosInstance;
