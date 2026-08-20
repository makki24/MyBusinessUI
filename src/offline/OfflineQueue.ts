import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "@offline_queue";

export interface QueuedRequest {
  id: string;
  url: string;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  description: string;
}

type QueueListener = (count: number) => void;
let listeners: QueueListener[] = [];

export const OfflineQueue = {
  addListener: (listener: QueueListener): (() => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  notifyListeners: async (): Promise<void> => {
    const count = await OfflineQueue.getCount();
    listeners.forEach((l) => {
      try {
        l(count);
      } catch (e) {
        // ignore
      }
    });
  },

  /**
   * Add a request to the offline queue.
   */
  enqueue: async (
    request: Omit<QueuedRequest, "id" | "timestamp" | "retryCount">,
  ): Promise<QueuedRequest> => {
    const queue = await OfflineQueue.getAll();
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    queue.push(queuedRequest);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    await OfflineQueue.notifyListeners();
    return queuedRequest;
  },

  /**
   * Get all queued requests.
   */
  getAll: async (): Promise<QueuedRequest[]> => {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  /**
   * Remove a request from the queue (after successful sync).
   */
  dequeue: async (id: string): Promise<void> => {
    const queue = await OfflineQueue.getAll();
    const filtered = queue.filter((r) => r.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    await OfflineQueue.notifyListeners();
  },

  /**
   * Update retry count for a failed request.
   */
  updateRetryCount: async (id: string): Promise<void> => {
    const queue = await OfflineQueue.getAll();
    const item = queue.find((r) => r.id === id);
    if (item) {
      item.retryCount += 1;
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }
  },

  /**
   * Get the count of pending requests.
   */
  getCount: async (): Promise<number> => {
    const queue = await OfflineQueue.getAll();
    return queue.length;
  },

  /**
   * Clear all queued requests.
   */
  clear: async (): Promise<void> => {
    await AsyncStorage.removeItem(QUEUE_KEY);
    await OfflineQueue.notifyListeners();
  },
};
