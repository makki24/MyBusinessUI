/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  render,
  fireEvent,
  act,
  waitFor,
  cleanup,
} from "@testing-library/react-native";
import LoanTransactionScreen from "../../screens/LoanTransactionsScreen";
import { RecoilRoot } from "recoil";
import { PaperProvider } from "react-native-paper";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

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
    const { getByTestId, getByText } = render(
      <RecoilRoot>
        <PaperProvider>
          <LoanTransactionScreen
            navigation={
              {
                navigate: jest.fn(),
              } as unknown as NavigationProp<ParamListBase>
            }
          />
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
          <LoanTransactionScreen
            navigation={
              {
                navigate: jest.fn(),
              } as unknown as NavigationProp<ParamListBase>
            }
          />
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
    const nav = {
      navigate: mockNavigate,
    } as unknown as NavigationProp<ParamListBase>;
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
