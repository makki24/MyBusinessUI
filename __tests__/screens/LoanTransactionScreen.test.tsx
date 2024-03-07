import React from "react";
import {
  render,
  fireEvent,
  screen,
  act,
  waitFor,
  cleanup,
} from "@testing-library/react-native";
import LoanTransactionScreen from "../../screens/LoanTransactionsScreen";
import { LoanToHoldingTransaction } from "../../types";
import { RecoilRoot } from "recoil";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Mock the entire module
jest.mock("../../services/ContributionService.ts", () => ({
  getLoanClearTransactions: jest.fn(() => [
    { id: 1, amount: 100, date: new Date("2023-12-10") },
  ]),
  deleteLoanClearTransactions: jest.fn(),
  // Add other methods as needed
}));

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: jest.fn(),
}));

const Stack = createStackNavigator();

describe("LoanTransactionScreen", () => {
  beforeEach(() => {});

  afterEach(cleanup);

  it("renders correctly", async () => {
    const mockTransactions = [
      { id: 1, amount: 100 },
    ] as LoanToHoldingTransaction[];

    const { getByTestId, getByText } = render(
      <RecoilRoot>
        <PaperProvider>
          <LoanTransactionScreen navigation={{ navigate: jest.fn() }} />
        </PaperProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      act(() => {
        const card = getByTestId("delete");
        fireEvent.press(card);

        const deleteModalText = getByText(
          "Are you sure you want to delete this loan transaction?",
        );
        expect(deleteModalText).toBeTruthy();
      });
    });
  });

  it("shows Snackbar after confirming transaction deletion", async () => {
    const { getByTestId } = render(
      <RecoilRoot>
        <PaperProvider>
          <LoanTransactionScreen navigation={{ navigate: jest.fn() }} />
        </PaperProvider>
      </RecoilRoot>,
    );

    // Trigger the action that leads to confirming transaction deletion
    await waitFor(() => {
      const deleteButton = getByTestId("delete");
      fireEvent.press(deleteButton);
    });

    // Confirm the transaction deletion
    await waitFor(() => {
      const confirmDeleteButton = getByTestId("confirm-delete-button");
      fireEvent.press(confirmDeleteButton);
    });

    // Check that the Snackbar appears
    await waitFor(() => {
      const snackbar = getByTestId("snackbar");
      expect(snackbar).toBeTruthy();
    });
  });

  it("navigates to Edit screen when editing a transaction", async () => {
    // Mock the navigate function
    const mockNavigate = jest.fn();
    const nav = { navigate: mockNavigate };
    jest
      .spyOn(require("@react-navigation/native"), "useNavigation")
      .mockReturnValue({
        navigate: mockNavigate,
      });

    const { getByTestId } = render(
      <RecoilRoot>
        <PaperProvider>
          <LoanTransactionScreen navigation={nav} />
        </PaperProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const editButton = getByTestId("transaction-item");
      fireEvent.press(editButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("ProfileStack", {
      screen: "ManageAmounts",
      params: expect.objectContaining({
        title: "Edit transaction",
        transaction: expect.objectContaining({
          id: 1,
          amount: 100,
          date: "2023-12-10T00:00:00.000Z",
          // Add other properties as needed
        }),
        isEditMode: true,
      }),
    });
  });
});
