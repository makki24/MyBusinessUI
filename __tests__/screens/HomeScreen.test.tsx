import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import HomeScreen from "../../screens/HomeScreen";
import { RecoilRoot } from "recoil";
import { Provider as PaperProvider } from "react-native-paper";
import { theme } from "../../src/styles/theme";
import { NavigationContainer } from "@react-navigation/native";

// Mock dependencies
jest.mock("expo-notifications", () => ({
  getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
}));

jest.mock("expo-linking", () => ({
  createURL: jest.fn(),
  useLinkTo: jest.fn(() => jest.fn()),
}));

jest.mock("@react-native-firebase/crashlytics", () => () => ({
  recordError: jest.fn(),
}));

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  mergeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  flushGetRequests: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
}));

jest.mock("../../src/notifications/Notification", () => "Notification");
jest.mock("../../src/components/common/ProfilePicture", () => "ProfilePicture");

// Mock Navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as import("@react-navigation/native").NavigationProp<
  import("@react-navigation/native").ParamListBase
>;

describe("HomeScreen UI & Navigation", () => {
  const setup = () => {
    return render(
      <RecoilRoot>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <HomeScreen navigation={mockNavigation} />
          </NavigationContainer>
        </PaperProvider>
      </RecoilRoot>,
    );
  };

  it("renders the welcome header correctly", async () => {
    const { getByText } = setup();
    await waitFor(() => {
      expect(getByText("MyBusiness")).toBeTruthy();
      expect(getByText("Financial Overview")).toBeTruthy();
    });
  });

  it("renders all dashboard cards", () => {
    const { getByText } = setup();
    expect(getByText("Work / Loan")).toBeTruthy();
    expect(getByText("Sale / Lending")).toBeTruthy();
    expect(getByText("Expense (اخراجات)")).toBeTruthy();
    expect(getByText("Manage User")).toBeTruthy();
    expect(getByText("Admin")).toBeTruthy();
    expect(getByText("Dashboard")).toBeTruthy();
  });

  it("navigates to WorkStack when Work card is pressed", () => {
    const { getByText } = setup();
    fireEvent.press(getByText("Work / Loan"));
    expect(mockNavigate).toHaveBeenCalledWith("WorkStack", { screen: "Work" });
  });

  it("navigates to SaleStack when Sale card is pressed", () => {
    const { getByText } = setup();
    fireEvent.press(getByText("Sale / Lending"));
    expect(mockNavigate).toHaveBeenCalledWith("SaleStack", { screen: "Sale" });
  });

  it("navigates to ExpenseStack when Expense card is pressed", () => {
    const { getByText } = setup();
    fireEvent.press(getByText("Expense (اخراجات)"));
    expect(mockNavigate).toHaveBeenCalledWith("ExpenseStack", {
      screen: "Expenses",
    });
  });

  it("navigates to UsersStack when Manage User card is pressed", () => {
    const { getByText } = setup();
    fireEvent.press(getByText("Manage User"));
    expect(mockNavigate).toHaveBeenCalledWith("UsersStack", {
      screen: "Users",
    });
  });

  it("navigates to AdminStack when Admin card is pressed", () => {
    const { getByText } = setup();
    fireEvent.press(getByText("Admin"));
    expect(mockNavigate).toHaveBeenCalledWith("HomeStack", {
      screen: "AdminStack",
      params: { title: "Admin" },
    });
  });

  it("navigates to DashboardStack when Dashboard card is pressed", () => {
    const { getByText } = setup();
    fireEvent.press(getByText("Dashboard"));
    expect(mockNavigate).toHaveBeenCalledWith("DashboardStack", {
      screen: "Dashboard",
      params: { title: "Dashboard" },
    });
  });
});
