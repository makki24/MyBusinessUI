import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiUrl } from "../app-env.config";
import { OfflineQueue } from "./OfflineQueue";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

type SyncListener = (status: SyncStatus) => void;

export interface SyncStatus {
  isSyncing: boolean;
  total: number;
  completed: number;
  failed: number;
  currentItem?: string;
}

let listeners: SyncListener[] = [];
let isSyncing = false;

export const SyncManager = {
  /**
   * Initialize network listener. Call once on app start.
   */
  init: (): (() => void) => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      if (state.isConnected && !isSyncing) {
        SyncManager.syncAll();
      }
    });
    return unsubscribe;
  },

  /**
   * Subscribe to sync status updates (for UI indicators).
   */
  addListener: (listener: SyncListener): (() => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  /**
   * Replay all queued requests in FIFO order.
   */
  syncAll: async (): Promise<void> => {
    if (isSyncing) return;
    isSyncing = true;

    const queue = await OfflineQueue.getAll();
    if (queue.length === 0) {
      isSyncing = false;
      return;
    }

    const status: SyncStatus = {
      isSyncing: true,
      total: queue.length,
      completed: 0,
      failed: 0,
    };
    notifyListeners(status);

    const token = await AsyncStorage.getItem("@token");
    if (!token) {
      status.isSyncing = false;
      notifyListeners(status);
      isSyncing = false;
      return;
    }

    // Validate token before processing queue
    try {
      await axios({
        method: "get",
        url: `${apiUrl}/login`,
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (tokenError) {
      status.isSyncing = false;
      notifyListeners(status);
      isSyncing = false;
      return;
    }

    for (const request of queue) {
      status.currentItem = request.description;
      notifyListeners(status);

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const config: any = {
          method: request.method.toLowerCase(),
          url: `${apiUrl}${request.url}`,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...request.headers,
          },
        };

        if (request.data && request.method !== "DELETE") {
          config.data = request.data;
        }

        await axios(config);
        await OfflineQueue.dequeue(request.id);
        status.completed += 1;
      } catch (error) {
        if (request.retryCount >= MAX_RETRIES) {
          status.failed += 1;
          // eslint-disable-next-line no-console
          console.error(
            `Sync failed permanently for: ${request.description}`,
            error,
          );
        } else {
          await OfflineQueue.updateRetryCount(request.id);
          status.failed += 1;

          // Exponential backoff
          const delay = BASE_DELAY_MS * Math.pow(2, request.retryCount);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      notifyListeners(status);
    }

    status.isSyncing = false;
    status.currentItem = undefined;
    notifyListeners(status);
    isSyncing = false;
  },

  /**
   * Check if currently online.
   */
  isOnline: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  },
};

function notifyListeners(status: SyncStatus) {
  listeners.forEach((l) => {
    try {
      l(status);
    } catch (e) {
      // ignore
    }
  });
}
