import fetchMock from "jest-fetch-mock";
import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react-native";
import AddExpenseScreen from "../../screens/AddExpenseScreen";
import { PaperProvider } from "react-native-paper";
import { RecoilRoot } from "recoil";
import { expenseTypesState, userState } from "../../recoil/atom";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
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

describe("AddExpenseScreen", () => {
  beforeEach(() => {});

  afterEach(() => {
    // Clean up on exiting
    cleanup();
    jest.clearAllMocks(); // Clear all mocks
  });

  it("should change selected expense type and receiving user state accordingly to isReceivingUser", () => {
    const types = [
      { id: "1", name: "Expense Type 1", isReceivingUser: true },
      { id: "2", name: "Expense Type 2", isReceivingUser: false },
    ];
    const { queryByTestId, getByTestId } = render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(expenseTypesState, types)}
      >
        <PaperProvider>
          <AddExpenseScreen
            route={{ params: { isEditMode: false, expense: null } }}
            navigation={null}
          />
        </PaperProvider>
      </RecoilRoot>,
    );

    const expenseTypeDropdown = getByTestId("expense-type-picker");

    fireEvent(expenseTypeDropdown, "onChangeValue", "1");
    fireEvent(expenseTypeDropdown, "setValue", "1");

    const userPicker = queryByTestId("user-picker");
    const tagsPicker = queryByTestId("tags-picker");

    expect(userPicker).toBeTruthy();
    expect(tagsPicker).toBeFalsy();
  });

  it("should change selected expense type and receiving user state accordingly to not isReceivingUser", () => {
    const types = [
      { id: "1", name: "Expense Type 1", isReceivingUser: true },
      { id: "2", name: "Expense Type 2", isReceivingUser: false },
    ];
    const { queryByTestId, getByTestId } = render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(expenseTypesState, types)}
      >
        <PaperProvider>
          <AddExpenseScreen
            route={{ params: { isEditMode: false, expense: null } }}
            navigation={null}
          />
        </PaperProvider>
      </RecoilRoot>,
    );

    const expenseTypeDropdown = getByTestId("expense-type-picker");

    fireEvent(expenseTypeDropdown, "onChangeValue", "2");
    fireEvent(expenseTypeDropdown, "setValue", "2");

    const userPicker = queryByTestId("user-picker");
    const tagsPicker = queryByTestId("tags-picker");

    expect(userPicker).toBeFalsy();
    expect(tagsPicker).toBeTruthy();
  });

  it("should navigate to 'AddContribution' screen when 'navigateToManageAmounts' is called", () => {
    const mockNavigation = {
      navigate: jest.fn(),
    } as unknown as NavigationProp<ParamListBase>;
    const types = [
      { id: "1", name: "Expense Type 1", isReceivingUser: true },
      { id: "2", name: "Expense Type 2", isReceivingUser: false },
    ];

    const setInitialState = (snapshot) => {
      snapshot.set(expenseTypesState, types);
      snapshot.set(userState, {
        amountHolding: 5,
      });
    };

    const { getByTestId, getByText } = render(
      <RecoilRoot initializeState={setInitialState}>
        <PaperProvider>
          <AddExpenseScreen
            route={{ params: { isEditMode: false, expense: null } }}
            navigation={mockNavigation}
          />
        </PaperProvider>
      </RecoilRoot>,
    );

    const expenseTypeDropdown = getByTestId("expense-type-picker");
    fireEvent(expenseTypeDropdown, "setValue", "2");

    fireEvent.changeText(getByTestId("Amount"), "10");

    // Open the modal
    fireEvent.press(getByText("Add Expense"));

    fireEvent.press(getByText("Declare contribution"));

    expect(mockNavigation.navigate).toHaveBeenCalledWith("ProfileStack", {
      screen: "AddContribution",
      params: { title: "Add Contribution" },
    });
  });
});
