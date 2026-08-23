/**
 * SyncManager Tests
 *
 * Bug #5: SyncManager.syncAll() replays queued write requests using a
 * potentially expired JWT token. If the token has expired during the
 * offline period, all queued mutations silently fail and are permanently
 * dropped after MAX_RETRIES, causing data loss.
 *
 * The fix should validate the token before attempting to replay the queue.
 * These tests will FAIL before the fix and PASS after.
 */
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SyncManager } from "../../src/offline/SyncManager";
import { OfflineQueue, QueuedRequest } from "../../src/offline/OfflineQueue";

// Mock dependencies
jest.mock("axios");
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

jest.mock("../../src/offline/OfflineQueue", () => ({
  OfflineQueue: {
    getAll: jest.fn(),
    dequeue: jest.fn(),
    updateRetryCount: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("SyncManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the internal isSyncing flag by direct manipulation
    // (needed because it's module-scoped)
  });

  describe("Bug #5: Token validation before sync replay", () => {
    const queuedRequest: QueuedRequest = {
      id: "req-1",
      url: "/api/works",
      method: "POST",
      data: { user: { id: 1 }, quantity: 10, amount: 100 },
      timestamp: Date.now(),
      retryCount: 0,
      description: "POST Work",
    };

    it("should validate token before replaying queue — reject expired token", async () => {
      // Setup: expired token in storage, one queued request
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        "expired-jwt-token",
      );
      (OfflineQueue.getAll as jest.Mock).mockResolvedValue([queuedRequest]);

      // The validation call (GET /login) should fail with 403
      mockedAxios.mockRejectedValueOnce({
        response: { status: 403, data: "Invalid or expired token" },
        message: "Request failed with status code 403",
      });

      const listener = jest.fn();
      SyncManager.addListener(listener);

      await SyncManager.syncAll();

      // The queued request should NOT have been attempted (no second axios call)
      // Only the validation call should have been made
      expect(mockedAxios).toHaveBeenCalledTimes(1);

      // The queued item should NOT have been dequeued (data preserved, not silently lost)
      expect(OfflineQueue.dequeue).not.toHaveBeenCalled();

      // Listener should have been notified of failure
      const lastCall = listener.mock.calls[listener.mock.calls.length - 1][0];
      expect(lastCall.isSyncing).toBe(false);
    });

    it("should proceed with sync when token is valid", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("valid-jwt-token");
      (OfflineQueue.getAll as jest.Mock).mockResolvedValue([queuedRequest]);

      // Validation call succeeds
      mockedAxios
        .mockResolvedValueOnce({
          data: { email: "test@example.com" },
          status: 200,
        }) // token validation
        .mockResolvedValueOnce({ data: queuedRequest.data, status: 200 }); // actual request

      (OfflineQueue.dequeue as jest.Mock).mockResolvedValue(undefined);

      await SyncManager.syncAll();

      // Both calls should have been made: validation + actual request
      expect(mockedAxios).toHaveBeenCalledTimes(2);
      expect(OfflineQueue.dequeue).toHaveBeenCalledWith("req-1");
    });

    it("should not attempt sync when no token is available", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (OfflineQueue.getAll as jest.Mock).mockResolvedValue([queuedRequest]);

      await SyncManager.syncAll();

      // Without a token, sync should not proceed — should not attempt any requests
      // that would just fail with 401/403
      expect(OfflineQueue.dequeue).not.toHaveBeenCalled();
    });
  });
});
