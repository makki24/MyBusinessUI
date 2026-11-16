import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import AddTransferScreen from "../../screens/AddTransferScreen";
import { RecoilRoot } from "recoil";
import { PaperProvider } from "react-native-paper";
import {
  userState,
  usersState,
  expenseTypesState,
  workTypesState,
  expensesState,
} from "../../recoil/atom";
import ExpenseService from "../../services/ExpenseService";
import { User, ExpenseType, WorkType } from "../../types";

jest.mock("../../services/ExpenseService", () => ({
  addExpense: jest.fn(() => Promise.resolve({ id: 101, amount: 2000 })),
}));

jest.mock("../../src/components/common/LoadingError", () => "LoadingError");
jest.mock("../../src/components/common/Loading", () => "Loading");
jest.mock("react-native-paper-dates", () => ({
  DatePickerInput: () => null,
  TimePickerModal: () => null,
}));

const mockLoggedInUser = {
  id: "1",
  name: "Current Manager",
  email: "mgr@test.com",
} as unknown as User;

const mockUserAlice = {
  id: "2",
  name: "Alice Worker",
} as unknown as User;

const mockUserBob = {
  id: "3",
  name: "Bob Contractor",
} as unknown as User;

const mockTransferType = {
  id: 1,
  name: "Transfer",
  type: "expense",
  defaultTags: [],
} as unknown as ExpenseType;

const mockWorkType = {
  id: 10,
  name: "Construction",
  type: "work",
} as unknown as WorkType;

const mockGoBack = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
  navigate: jest.fn(),
} as unknown as import("@react-navigation/native").NavigationProp<
  import("@react-navigation/native").ParamListBase
>;

const renderScreen = (routeParams = {}) => {
  return render(
    <RecoilRoot
      initializeState={(snapshot) => {
        snapshot.set(userState, mockLoggedInUser);
        snapshot.set(usersState, [
          mockLoggedInUser,
          mockUserAlice,
          mockUserBob,
        ]);
        snapshot.set(expenseTypesState, [mockTransferType]);
        snapshot.set(workTypesState, [mockWorkType]);
        snapshot.set(expensesState, []);
      }}
    >
      <PaperProvider>
        <AddTransferScreen
          navigation={mockNavigation}
          route={{ params: routeParams }}
        />
      </PaperProvider>
    </RecoilRoot>,
  );
};

describe("AddTransferScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders in default 'I Received' mode with receiver locked to logged-in user", () => {
    renderScreen();

    // Check mode chips
    expect(screen.getByTestId("chip-received")).toBeTruthy();
    expect(screen.getByTestId("chip-paid")).toBeTruthy();
    expect(screen.getByTestId("chip-other")).toBeTruthy();

    // Receiver should be locked to logged-in user
    expect(screen.getByTestId("locked-receiver-card")).toBeTruthy();
    expect(screen.getByText("Current Manager")).toBeTruthy();

    // Sender should have dropdown picker
    expect(screen.getByTestId("sender-picker")).toBeTruthy();
  });

  it("switches to 'I Paid' mode when chip is pressed", () => {
    renderScreen();

    fireEvent.press(screen.getByTestId("chip-paid"));

    // Sender is now locked to logged-in user
    expect(screen.getByTestId("locked-sender-card")).toBeTruthy();
    // Receiver has dropdown picker
    expect(screen.getByTestId("receiver-picker")).toBeTruthy();
  });

  it("switches to 'Between Others' mode when chip is pressed", () => {
    renderScreen();

    fireEvent.press(screen.getByTestId("chip-other"));

    // Both sender and receiver have pickers
    expect(screen.getByTestId("sender-picker")).toBeTruthy();
    expect(screen.getByTestId("receiver-picker")).toBeTruthy();
  });

  it("swaps direction when swap button is pressed", () => {
    renderScreen();

    // Default mode: RECEIVED (locked receiver)
    expect(screen.getByTestId("locked-receiver-card")).toBeTruthy();

    // Press swap button
    fireEvent.press(screen.getByTestId("swap-direction-button"));

    // Swapped to PAID (locked sender)
    expect(screen.getByTestId("locked-sender-card")).toBeTruthy();
    expect(screen.getByTestId("receiver-picker")).toBeTruthy();
  });

  it("toggles optional details section", () => {
    renderScreen();

    expect(screen.queryByTestId("description-input")).toBeNull();

    fireEvent.press(screen.getByTestId("toggle-details-button"));
    expect(screen.getByTestId("description-input")).toBeTruthy();
  });

  it("shows error if submitting without amount or sender/receiver", async () => {
    renderScreen();

    // Amount is empty, button is disabled
    const submitButton = screen.getByTestId("submit-transfer-button");
    expect(submitButton.props.accessibilityState?.disabled).toBe(true);
  });

  it("submits transfer successfully and calls navigation.goBack", async () => {
    // Start with prefilled params: received from Alice
    renderScreen({
      direction: "RECEIVED",
      senderId: "2",
      amount: "1500",
    });

    const amountInput = screen.getByTestId("amount-input");
    expect(amountInput.props.value).toBe("1500");

    const submitButton = screen.getByTestId("submit-transfer-button");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(ExpenseService.addExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1500,
          type: expect.objectContaining({ id: 1 }),
          sender: expect.objectContaining({ id: "2" }),
          receiver: expect.objectContaining({ id: "1" }),
        }),
      );
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it("prevents submitting when sender equals receiver in OTHER mode", async () => {
    renderScreen({
      direction: "OTHER",
      senderId: "2",
      receiverId: "2",
      amount: "500",
    });

    const submitButton = screen.getByTestId("submit-transfer-button");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Sender and receiver cannot be the same person."),
      ).toBeTruthy();
    });
    expect(ExpenseService.addExpense).not.toHaveBeenCalled();
  });
});
