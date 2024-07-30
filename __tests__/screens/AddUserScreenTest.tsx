import fetchMock from "jest-fetch-mock";
import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { RecoilRoot } from "recoil";
import AddUserScreen from "../../screens/AddUserScreen";
import UserService from "../../services/UserService";
import { Role } from "../../types";
import { rolesState } from "../../recoil/atom";
jest.useFakeTimers();

// Enable fetch mocks
fetchMock.enableMocks();

jest.mock("@react-native-async-storage/async-storage", () => {
  const mockStorage: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(() => Promise.resolve("dummyToken")),
      setItem: jest.fn((key: string, value: string) => {
        mockStorage[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        delete mockStorage[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
        return Promise.resolve();
      }),
    },
  };
});

jest.mock("../../services/UserService");

describe("AddUserScreen", () => {
  beforeEach(() => {});

  afterEach(() => {
    // Clean up on exiting
    cleanup();
    jest.clearAllMocks(); // Clear all mocks
  });

  it("calls userService.addUser with correct parameters when adding new user", async () => {
    // Mock data
    const mockUser = {
      name: "username",
      email: "email",
      picture: "imageUrl",
      phoneNumber: "1",
      roles: [{ id: "1" }] as Role[],
      amountHolding: 0,
      amountToReceive: 0,
      isOwnAsset: false,
      isOwnLiability: false,
    };

    // Mock route params
    const mockRouteParams = {
      params: {
        isEditMode: false,
        user: null,
      },
    };
    const roles = [{ id: "1", name: "MEMBER" }] as Role[];

    // Render component
    const { getByTestId, getByText } = render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(rolesState, roles)}
      >
        <PaperProvider>
          <AddUserScreen route={mockRouteParams} />
        </PaperProvider>
      </RecoilRoot>,
    );

    fireEvent.changeText(getByTestId("username"), "username");

    // Fill input fields
    fireEvent.changeText(getByTestId("Email*"), "email@e.com");

    fireEvent.changeText(getByTestId("PhoneNumber*"), "9999999999");

    // Mock WorkService.addWork implementation
    (
      UserService.addUser as jest.MockedFunction<typeof UserService.addUser>
    ).mockResolvedValueOnce(Promise.resolve(mockUser));

    // Submit form
    fireEvent.press(getByText("Add User"));

    // Assertion
    await waitFor(() => {
      expect(UserService.addUser).toHaveBeenCalledWith({
        name: "username",
        email: "email@e.com",
        picture: undefined,
        phoneNumber: "9999999999",
        roles: [{ id: "1", name: "MEMBER" }],
        amountHolding: NaN,
        amountToReceive: NaN,
        isOwnAsset: false,
        isOwnLiability: false,
      });
    });
  });

  it("calls userService.addUser with correct parameters when edititng new user", async () => {
    // Mock data
    const mockUser = {
      name: "username",
      email: "email",
      picture: "imageUrl:googleusercontent.com",
      phoneNumber: "1",
      roles: [{ id: "2" }] as Role[],
      amountHolding: 0,
      amountToReceive: 0,
      id: "5",
      isOwnAsset: false,
      isOwnLiability: false,
    };

    const mockRouteParams = {
      params: {
        isEditMode: true,
        user: mockUser,
      },
    };
    const roles = [{ id: "1", name: "MEMBER" }] as Role[];

    // Render component
    const { getByTestId, getByText } = render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(rolesState, roles)}
      >
        <PaperProvider>
          <AddUserScreen route={mockRouteParams} />
        </PaperProvider>
      </RecoilRoot>,
    );

    fireEvent.changeText(getByTestId("username"), "usernames");

    // Mock WorkService.addWork implementation
    (
      UserService.addUser as jest.MockedFunction<typeof UserService.addUser>
    ).mockResolvedValueOnce(Promise.resolve(mockUser));

    // Submit form
    fireEvent.press(getByText("Update User"));

    // Assertion
    await waitFor(() => {
      expect(UserService.addUser).toHaveBeenCalledWith({
        name: "usernames",
        email: "email",
        picture: "imageUrl:googleusercontent.com",
        phoneNumber: "1",
        roles: [{ id: "2" }],
        amountHolding: 0,
        amountToReceive: 0,
        id: "5",
        isOwnAsset: false,
        isOwnLiability: false,
      });
    });
  });
});
