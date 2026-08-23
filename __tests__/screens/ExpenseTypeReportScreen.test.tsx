import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import ExpenseTypeReportScreen from "../../screens/ExpenseTypeReportScreen";
import { RecoilRoot } from "recoil";
import { PaperProvider } from "react-native-paper";
import {
  userState,
  usersState,
  expenseTypesState,
  tagsState,
} from "../../recoil/atom";
import ExpenseService from "../../services/ExpenseService";
import { User, ExpenseType, Tag } from "../../types";

// Mock services
jest.mock("../../services/ReportService", () => ({
  getReportByExpenseType: jest.fn(() => Promise.resolve([])),
  getExpenseSummaryByType: jest.fn(() => Promise.resolve([])),
}));

jest.mock("../../services/ExpenseService", () => ({
  addExpense: jest.fn(() => Promise.resolve({ id: 100 })),
}));

// Mock components
jest.mock("../../src/components/common/LoadingError", () => "LoadingError");
jest.mock("../../src/components/common/Loading", () => "Loading");
jest.mock("../../components/ReportItem", () => "ReportItem");

const mockLoggedInUser = {
  id: "10",
  name: "Me",
  email: "me@test.com",
} as unknown as User;

const mockExpenseTypeRegular = {
  id: 1,
  name: "Mazori",
  type: "expense",
  isReceivingUser: false,
  defaultTags: [{ id: 101, name: "DefaultTag" }],
} as unknown as ExpenseType;

const mockExpenseTypeTransfer = {
  id: 2,
  name: "Transfer",
  type: "expense",
  isReceivingUser: true,
  defaultTags: [],
} as unknown as ExpenseType;

const mockTags = [
  { id: 101, name: "DefaultTag" },
  { id: 102, name: "ExtraTag" },
] as Tag[];

const renderScreen = (expenseTypeId: number) => {
  const route = {
    params: {
      expenseTypeId,
      expenseTypeName: "Test Expense",
    },
  };

  const navigation = {
    setOptions: jest.fn(),
  };

  return render(
    <RecoilRoot
      initializeState={(snapshot) => {
        snapshot.set(userState, mockLoggedInUser);
        snapshot.set(usersState, [mockLoggedInUser]);
        snapshot.set(expenseTypesState, [
          mockExpenseTypeRegular,
          mockExpenseTypeTransfer,
        ]);
        snapshot.set(tagsState, mockTags);
      }}
    >
      <PaperProvider>
        {/* @ts-expect-error Testing with partial route/navigation mocks */}
        <ExpenseTypeReportScreen route={route} navigation={navigation} />
      </PaperProvider>
    </RecoilRoot>,
  );
};

describe("ExpenseTypeReportScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 'No Expense Type ID provided' when expenseTypeId is missing", () => {
    const route = { params: {} };
    render(
      <RecoilRoot>
        <PaperProvider>
          {/* @ts-expect-error Testing with partial route/navigation mocks */}
          <ExpenseTypeReportScreen
            route={route}
            navigation={{ setOptions: jest.fn() }}
          />
        </PaperProvider>
      </RecoilRoot>,
    );
    expect(screen.getByText("No Expense Type ID provided")).toBeTruthy();
  });

  it("shows tag picker when message/options toggle is pressed for non-Transfer type", () => {
    renderScreen(1);
    const messageToggle = screen.getByTestId("message-toggle-button");
    fireEvent.press(messageToggle);
    expect(screen.getByTestId("tags-picker")).toBeTruthy();
  });

  it("does NOT show tag picker when message/options toggle is pressed for Transfer type", () => {
    renderScreen(2);
    const messageToggle = screen.getByTestId("message-toggle-button");
    fireEvent.press(messageToggle);
    expect(screen.queryByTestId("tags-picker")).toBeNull();
  });

  it("calls ExpenseService.addExpense with default tags when sent for non-Transfer type", async () => {
    renderScreen(1);

    const amountInput = screen.getByPlaceholderText("0");
    fireEvent.changeText(amountInput, "250");

    const sendButton = screen.getByTestId("send-icon-button");
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(ExpenseService.addExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 250,
          type: expect.objectContaining({ id: 1 }),
          tags: [{ id: 101 }],
        }),
      );
    });
  });
});
