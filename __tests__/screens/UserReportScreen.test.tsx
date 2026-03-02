import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import UserReportScreen from "../../screens/UserReportScreen";
import { RecoilRoot } from "recoil";
import { PaperProvider } from "react-native-paper";
import { userState, usersState, expenseTypesState } from "../../recoil/atom";
import ExpenseService from "../../services/ExpenseService";
import { User, ExpenseType } from "../../types";

// Mock services
jest.mock("../../services/ReportService", () => ({
  getReportByUser: jest.fn(() => Promise.resolve([])),
}));

jest.mock("../../services/ExpenseService", () => ({
  addExpense: jest.fn(() => Promise.resolve({ id: 99 })),
}));

// Mock components
jest.mock("../../src/components/common/LoadingError", () => "LoadingError");
jest.mock("../../src/components/common/Loading", () => "Loading");
jest.mock("../../components/ReportItem", () => "ReportItem");

const mockLoggedInUser = {
  id: "10",
  name: "Me",
  email: "me@test.com",
  phoneNumber: "1234567890",
  amountToReceive: 0,
  amountHolding: 0,
  picture: "",
  userProperties: {
    isOwnAsset: false,
    isOwnLiability: false,
    workTypePrices: [],
  },
  roles: [],
} as unknown as User;

const mockOtherUser = {
  id: "20",
  name: "Alice",
  email: "alice@test.com",
  phoneNumber: "0987654321",
  amountToReceive: 500,
  amountHolding: 200,
  picture: "",
  userProperties: {
    isOwnAsset: false,
    isOwnLiability: false,
    workTypePrices: [],
  },
  roles: [],
} as unknown as User;

const mockTransferType = {
  id: 5,
  name: "Transfer",
  type: "expense",
  defaultTags: [],
} as unknown as ExpenseType;

const renderScreen = (userId: number, loggedInId = "10") => {
  const route = { params: { userId } };
  const loggedIn = { ...mockLoggedInUser, id: loggedInId };

  return render(
    <RecoilRoot
      initializeState={(snapshot) => {
        snapshot.set(userState, loggedIn);
        snapshot.set(usersState, [loggedIn, mockOtherUser]);
        snapshot.set(expenseTypesState, [mockTransferType]);
      }}
    >
      <PaperProvider>
        {/* @ts-expect-error Testing with partial route/navigation mocks */}
        <UserReportScreen route={route} navigation={{}} />
      </PaperProvider>
    </RecoilRoot>,
  );
};

describe("UserReportScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 'No user ID provided' when no userId", () => {
    const route = { params: {} };
    render(
      <RecoilRoot>
        <PaperProvider>
          {/* @ts-expect-error Testing with partial route/navigation mocks */}
          <UserReportScreen route={route} navigation={{}} />
        </PaperProvider>
      </RecoilRoot>,
    );
    expect(screen.getByText("No user ID provided")).toBeTruthy();
  });

  it("does not show 'No user ID provided' when userId is present", () => {
    renderScreen(20);
    expect(screen.queryByText("No user ID provided")).toBeNull();
  });

  it("shows payment bar for a different user", () => {
    renderScreen(20);
    expect(screen.getByText("Sending to")).toBeTruthy();
    expect(screen.getByText("Alice")).toBeTruthy();
  });

  it("hides payment bar when viewing own report", () => {
    renderScreen(10);
    expect(screen.queryByText("Sending to")).toBeNull();
  });

  it("send button is disabled when amount is empty", () => {
    renderScreen(20);
    const sendButton = screen.getByTestId("send-icon-button");
    // The icon button should be disabled
    expect(sendButton.props.accessibilityState?.disabled).toBe(true);
  });

  it("shows message input when message toggle is pressed", () => {
    renderScreen(20);
    const messageToggle = screen.getByTestId("message-toggle-button");
    fireEvent.press(messageToggle);
    expect(screen.getByPlaceholderText("Add a message...")).toBeTruthy();
  });

  it("calls ExpenseService.addExpense on send", async () => {
    renderScreen(20);

    // Enter amount
    const amountInput = screen.getByPlaceholderText("0");
    fireEvent.changeText(amountInput, "500");

    // Press send
    const sendButton = screen.getByTestId("send-icon-button");
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(ExpenseService.addExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 500,
          type: expect.objectContaining({ id: 5 }),
          receiver: expect.objectContaining({ id: "20" }),
        }),
      );
    });
  });

  it("clears amount after successful send", async () => {
    renderScreen(20);

    const amountInput = screen.getByPlaceholderText("0");
    fireEvent.changeText(amountInput, "100");
    fireEvent.press(screen.getByTestId("send-icon-button"));

    await waitFor(() => {
      expect(ExpenseService.addExpense).toHaveBeenCalled();
    });

    // Amount should be cleared
    await waitFor(() => {
      expect(screen.getByPlaceholderText("0").props.value).toBe("");
    });
  });
});
