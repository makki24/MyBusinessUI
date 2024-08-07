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
import { RecoilRoot } from "recoil";
import { PaperProvider } from "react-native-paper";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import ExpenseScreen from "../../screens/ExpenseScreen";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { expensesState } from "../../recoil/atom";

// Mock the entire module
jest.mock("../../services/ExpenseService.ts", () => ({
  getExpenses: jest.fn(() => []),
  // Add other methods as needed
}));

jest.mock("../../src/service/FilterService", () => ({
  getExpenseFilters: jest.fn(() => ({
    user: [],
    sender: [],
    receiver: [],
  })),
}));

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: jest.fn(),
}));

const Stack = createStackNavigator();

describe("ExpenseScreen", () => {
  beforeEach(() => {});

  afterEach(cleanup);

  it("renders correctly", async () => {
    const mockNavigation = {
      navigate: jest.fn(),
    } as unknown as NavigationProp<ParamListBase>;

    const { getByTestId, getByText } = render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(expensesState, [])}
      >
        <PaperProvider>
          <BottomSheetModalProvider>
            <ExpenseScreen navigation={mockNavigation} />
          </BottomSheetModalProvider>
        </PaperProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      act(() => {
        fireEvent.press(getByTestId("addItem"));

        expect(mockNavigation.navigate).toHaveBeenCalledWith("ExpenseStack", {
          screen: "AddExpense",
          params: { title: "Add Expense" },
        });
      });
    });
  });
});
