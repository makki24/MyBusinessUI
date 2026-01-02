import React from "react";
import { render, waitFor, cleanup, act } from "@testing-library/react-native";
import LoginScreen from "../../screens/LoginScreen";

// Mock the fetch function
import fetchMock from "jest-fetch-mock";
import { PaperProvider } from "react-native-paper";
import { RecoilRoot } from "recoil";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import { AuthSessionResult } from "expo-auth-session";

// Enable fetch mocks
fetchMock.enableMocks();

// Define custom mock functions for AsyncStorage
// Mock AsyncStorage functions
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

// Mock useAuthRequest function
jest.mock("expo-auth-session/providers/google", () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

describe("LoginScreen", () => {
  afterEach(() => {
    // Clean up on exiting
    cleanup();
    jest.clearAllMocks(); // Clear all mocks
  });

  beforeEach(() => {
    fetchMock.resetMocks(); // Clear all instances of fetch mock
    fetchMock.mockResponseOnce(JSON.stringify({ data: "12345" }));
  });

  it("renders the Google sign-in button when user is not logged in", async () => {
    const navigation = {
      navigate: jest.fn(),
    };

    const { findByText } = render(
      <RecoilRoot>
        <PaperProvider>
          <LoginScreen navigation={navigation} />
        </PaperProvider>
      </RecoilRoot>,
    );

    const button = await findByText("Sign in with Google");

    expect(button).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it("if no token is present", async () => {
    const navigation = {
      navigate: jest.fn(),
    };
    const getItemSpy = jest.spyOn(AsyncStorage, "getItem");
    getItemSpy.mockResolvedValue("abcd"); // Use mockResolvedValue for clarity

    const { queryByText } = render(
      <RecoilRoot>
        <PaperProvider>
          <LoginScreen navigation={navigation} />
        </PaperProvider>
      </RecoilRoot>,
    );

    await waitFor(async () => {
      const button = await queryByText("Sign in with Google");

      expect(button).toBeNull();
    });

    getItemSpy.mockRestore();
  });

  it("calls loginOrSignUp on successful response", async () => {
    // Mock the useAuthRequest hook
    fetchMock.resetMocks();
    fetchMock.mockResponse(
      JSON.stringify({ data: { id: "a" } }), // Your response body
      {
        status: 200, // Your response status
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your_token", // Your bearer token
        },
      },
    );
    const mockResponse = {
      type: "success",
      authentication: { accessToken: "mockToken" },
    };
    const mockPromptAsync = jest.fn();
    const useAuthRequestMock = jest.spyOn(Google, "useAuthRequest");
    useAuthRequestMock.mockReturnValue([
      null,
      mockResponse as AuthSessionResult,
      mockPromptAsync,
    ]);
    const setItemSpy = jest.spyOn(AsyncStorage, "setItem");

    // Render the component
    const { rerender } = render(
      <RecoilRoot>
        <PaperProvider>
          <LoginScreen navigation={{ navigate: jest.fn() }} />
        </PaperProvider>
      </RecoilRoot>,
    );

    await act(async () => {
      await waitFor(() => expect(fetch).toHaveBeenCalled());

      // Trigger a rerender to run the effect with the mocked response
      rerender(
        <RecoilRoot>
          <PaperProvider>
            <LoginScreen navigation={{ navigate: jest.fn() }} />
          </PaperProvider>
        </RecoilRoot>,
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(`undefined/loginOrSignUp`, {
          method: "GET",
          headers: {
            Authorization: `Bearer mockToken`,
            "Content-Type": "application/json",
          },
        });
      });
    });

    expect(setItemSpy).toHaveBeenCalledWith("@token", "your_token");
  });
});
