import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import MonthlyBreakdownScreen from "../../screens/MonthlyBreakdownScreen";
import { Provider as PaperProvider } from "react-native-paper";
import { theme } from "../../src/styles/theme";
import reportService from "../../services/ReportService";

jest.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));

jest.mock("react-native-gifted-charts", () => ({
  PieChart: "PieChart",
  BarChart: "BarChart",
}));

jest.mock("react-native-paper-dates", () => ({
  DatePickerModal: "DatePickerModal",
}));

jest.mock("../../services/ReportService", () => ({
  getExpenseSummaryByType: jest.fn(),
  getWorkSummaryByType: jest.fn(),
  getReport: jest.fn(),
}));

describe("MonthlyBreakdownScreen", () => {
  const mockExpenseData = [
    {
      baseTransactionType: { name: "Fuel" },
      totalAmount: 4000,
    },
    {
      baseTransactionType: { name: "Transfer" },
      totalAmount: 10000,
    },
    {
      baseTransactionType: { name: "Maintenance" },
      totalAmount: 2000,
    },
  ];

  const mockWorkData = [
    {
      baseTransactionType: { name: "Plugging" },
      totalAmount: 12000,
    },
    {
      baseTransactionType: { name: "Harvesting" },
      totalAmount: 8000,
    },
  ];

  const mockAggregateData = {
    totalWorkAmount: 20000,
    totalExpenseAmount: 6000,
    totalSaleAmount: 0,
    totalContributionAmount: 15000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (reportService.getExpenseSummaryByType as jest.Mock).mockResolvedValue(
      mockExpenseData,
    );
    (reportService.getWorkSummaryByType as jest.Mock).mockResolvedValue(
      mockWorkData,
    );
    (reportService.getReport as jest.Mock).mockResolvedValue(mockAggregateData);
  });

  it("renders date range filter chips and calls report service on mount", async () => {
    const { getByText } = render(
      <PaperProvider theme={theme}>
        <MonthlyBreakdownScreen />
      </PaperProvider>,
    );

    expect(getByText("This Month")).toBeTruthy();
    expect(getByText("Last Month")).toBeTruthy();
    expect(getByText("This Quarter")).toBeTruthy();
    expect(getByText("All Time")).toBeTruthy();
    expect(getByText("Custom")).toBeTruthy();

    await waitFor(() => {
      expect(reportService.getExpenseSummaryByType).toHaveBeenCalled();
      expect(reportService.getWorkSummaryByType).toHaveBeenCalled();
      expect(reportService.getReport).toHaveBeenCalled();
    });
  });

  it("renders financial comparison section and 6-month trend chart", async () => {
    const { getByText, getAllByText } = render(
      <PaperProvider theme={theme}>
        <MonthlyBreakdownScreen />
      </PaperProvider>,
    );

    await waitFor(() => {
      expect(getByText("Financial Comparison & Balance")).toBeTruthy();
      expect(getByText("Operating Outflow")).toBeTruthy();
      expect(getAllByText("Contributions").length).toBeGreaterThan(0);
      expect(getByText("6-Month Trend & Comparison")).toBeTruthy();
    });
  });

  it("filters out Transfer expense types from expenses breakdown", async () => {
    const { getByText, queryByText } = render(
      <PaperProvider theme={theme}>
        <MonthlyBreakdownScreen />
      </PaperProvider>,
    );

    await waitFor(() => {
      // Fuel & Maintenance should be displayed
      expect(getByText("Fuel")).toBeTruthy();
      expect(getByText("Maintenance")).toBeTruthy();

      // Transfer must be filtered out!
      expect(queryByText("Transfer")).toBeNull();

      // Expense and Work titles
      expect(getByText("Expenses by Type")).toBeTruthy();
      expect(getByText("Work by Type")).toBeTruthy();
    });
  });

  it("handles switching date range presets", async () => {
    const { getByText } = render(
      <PaperProvider theme={theme}>
        <MonthlyBreakdownScreen />
      </PaperProvider>,
    );

    let initialCalls = 0;
    await waitFor(() => {
      initialCalls = (reportService.getExpenseSummaryByType as jest.Mock).mock
        .calls.length;
      expect(initialCalls).toBeGreaterThan(0);
    });

    fireEvent.press(getByText("Last Month"));

    await waitFor(() => {
      const newCalls = (reportService.getExpenseSummaryByType as jest.Mock).mock
        .calls.length;
      expect(newCalls).toBeGreaterThan(initialCalls);
    });
  });
});
