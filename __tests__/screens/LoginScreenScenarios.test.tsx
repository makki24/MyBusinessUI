/**
 * LoginScreen E2E Scenario Tests
 *
 * These tests cover the login screen behavior across various scenarios:
 *   - Bug #1: Expired JWT with cached user should NOT silently log in
 *   - Bug #1b: Stale @token should be cleared on auth failure
 *   - Offline mode with cached user (should work)
 *   - Offline mode without cached user (should show error)
 *
 * Tests are written to FAIL against the current code and PASS after the fixes.
 */
import React from "react";
import { render, waitFor, cleanup } from "@testing-library/react-native";
import LoginScreen from "../../screens/LoginScreen";
import fetchMock from "jest-fetch-mock";
import { PaperProvider } from "react-native-paper";
import { RecoilRoot } from "recoil";
import AsyncStorage from "@react-native-async-storage/async-storage";

fetchMock.enableMocks();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock("expo-auth-session/providers/google", () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

const mockUser = {
  name: "Test User",
  email: "test@example.com",
  picture: "https://example.com/pic.jpg",
  phoneNumber: "1234567890",
  roles: [],
  userProperties: {
    isOwnAsset: false,
    isOwnLiability: false,
    workTypePrices: [],
  },
};

describe("LoginScreen Scenarios", () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // ───────────────────────────────────────────────────────────
  // Bug #1: Expired JWT with cached user — should NOT silently log in
  //
  // Current behavior:
  //   loginFunc catches the 403 error from LoginService.
  //   The error has no .response property (plain Error from fetch),
  //   so `!loginError.response` is true, making `isNetworkError = true`.
  //   The code then reads @user cache and calls setUserInfo(cachedUser),
  //   silently logging the user in with stale data.
  //
  // Expected behavior after fix:
  //   403 should NOT be treated as a network error.
  //   The stale @token should be cleared from storage.
  //   The user should see the "Sign in with Google" button, not "Continue to Home".
  // ───────────────────────────────────────────────────────────
  describe("Bug #1: Expired JWT should not silently use cached user", () => {
    it("should show Sign in button (not Continue to Home) when JWT is expired", async () => {
      const getItemSpy = jest.spyOn(AsyncStorage, "getItem");
      getItemSpy.mockImplementation((key: string) => {
        if (key === "@token") return Promise.resolve("expired-jwt-token");
        if (key === "@user") return Promise.resolve(JSON.stringify(mockUser));
        return Promise.resolve(null);
      });

      // Backend returns 403 Forbidden for expired JWT
      fetchMock.mockResponseOnce(
        "Invalid or expired token, Please login again",
        { status: 403 },
      );

      const { queryByText } = render(
        <RecoilRoot>
          <PaperProvider>
            <LoginScreen
              navigation={{ navigate: jest.fn(), toggleDrawer: jest.fn() }}
            />
          </PaperProvider>
        </RecoilRoot>,
      );

      // Wait for the async login attempt to complete
      await waitFor(
        () => {
          // After the 403 response, the user should NOT be logged in with cached data
          // The "Sign in with Google" button should be visible
          const signInButton = queryByText("Sign in with Google");
          expect(signInButton).toBeTruthy();
        },
        { timeout: 3000 },
      );

      // "Continue to Home" should NOT be visible (would mean user was silently logged in)
      const continueButton = queryByText("Continue to Home");
      expect(continueButton).toBeNull();
    });

    it("should clear stale @token when backend returns 403 (expired JWT)", async () => {
      const getItemSpy = jest.spyOn(AsyncStorage, "getItem");
      getItemSpy.mockImplementation((key: string) => {
        if (key === "@token") return Promise.resolve("expired-jwt-token");
        if (key === "@user") return Promise.resolve(JSON.stringify(mockUser));
        return Promise.resolve(null);
      });

      fetchMock.mockResponseOnce(
        "Invalid or expired token, Please login again",
        { status: 403 },
      );

      const removeItemSpy = jest.spyOn(AsyncStorage, "removeItem");

      render(
        <RecoilRoot>
          <PaperProvider>
            <LoginScreen
              navigation={{ navigate: jest.fn(), toggleDrawer: jest.fn() }}
            />
          </PaperProvider>
        </RecoilRoot>,
      );

      await waitFor(
        () => {
          // The stale @token MUST be cleared so the next app open doesn't retry it
          expect(removeItemSpy).toHaveBeenCalledWith("@token");
        },
        { timeout: 3000 },
      );
    });
  });

  // ───────────────────────────────────────────────────────────
  // Scenario: Genuine offline mode — should use cached user
  // ───────────────────────────────────────────────────────────
  describe("Offline mode with cached user", () => {
    it("should show logged-in view when truly offline with cached user", async () => {
      const getItemSpy = jest.spyOn(AsyncStorage, "getItem");
      getItemSpy.mockImplementation((key: string) => {
        if (key === "@token") return Promise.resolve("valid-jwt-token");
        if (key === "@user") return Promise.resolve(JSON.stringify(mockUser));
        return Promise.resolve(null);
      });

      // Simulate a real network failure (TypeError with "Network request failed")
      fetchMock.mockRejectOnce(new TypeError("Network request failed"));

      const { queryByText } = render(
        <RecoilRoot>
          <PaperProvider>
            <LoginScreen
              navigation={{ navigate: jest.fn(), toggleDrawer: jest.fn() }}
            />
          </PaperProvider>
        </RecoilRoot>,
      );

      await waitFor(
        () => {
          // For genuine network errors with cached user, should show logged-in view
          const continueButton = queryByText("Continue to Home");
          expect(continueButton).toBeTruthy();
        },
        { timeout: 3000 },
      );

      // Sign-in button should NOT be visible
      const signInButton = queryByText("Sign in with Google");
      expect(signInButton).toBeNull();
    });

    it("should show sign-in when offline with no cached user", async () => {
      const getItemSpy = jest.spyOn(AsyncStorage, "getItem");
      getItemSpy.mockImplementation((key: string) => {
        if (key === "@token") return Promise.resolve("valid-jwt-token");
        if (key === "@user") return Promise.resolve(null); // No cached user
        return Promise.resolve(null);
      });

      fetchMock.mockRejectOnce(new TypeError("Network request failed"));

      const { findByText } = render(
        <RecoilRoot>
          <PaperProvider>
            <LoginScreen
              navigation={{ navigate: jest.fn(), toggleDrawer: jest.fn() }}
            />
          </PaperProvider>
        </RecoilRoot>,
      );

      await waitFor(async () => {
        const button = await findByText("Sign in with Google");
        expect(button).toBeTruthy();
      });
    });
  });

  // ───────────────────────────────────────────────────────────
  // Bug #1b: Stale token cleanup on auth failure without cached user
  // ───────────────────────────────────────────────────────────
  describe("Stale token cleanup", () => {
    it("should clear @token from storage on auth failure to prevent retry loop", async () => {
      const getItemSpy = jest.spyOn(AsyncStorage, "getItem");
      getItemSpy.mockImplementation((key: string) => {
        if (key === "@token") return Promise.resolve("expired-jwt-token");
        if (key === "@user") return Promise.resolve(null); // No cached user
        return Promise.resolve(null);
      });

      fetchMock.mockResponseOnce(
        "Invalid or expired token, Please login again",
        { status: 403 },
      );

      const removeItemSpy = jest.spyOn(AsyncStorage, "removeItem");

      render(
        <RecoilRoot>
          <PaperProvider>
            <LoginScreen
              navigation={{ navigate: jest.fn(), toggleDrawer: jest.fn() }}
            />
          </PaperProvider>
        </RecoilRoot>,
      );

      await waitFor(
        () => {
          expect(removeItemSpy).toHaveBeenCalledWith("@token");
        },
        { timeout: 3000 },
      );
    });
  });
});
