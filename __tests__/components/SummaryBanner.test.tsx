import React from "react";
import { render } from "@testing-library/react-native";
import SummaryBanner from "../../src/components/home/SummaryBanner";
import { Provider as PaperProvider } from "react-native-paper";
import { theme } from "../../src/styles/theme";

jest.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));

describe("SummaryBanner", () => {
  const mockSummary = {
    month: "August 2026",
    totalWorkAmount: 15000,
    totalExpenseAmount: 5000,
    totalContributionAmount: 3000,
    workCount: 12,
    expenseCount: 8,
    contributionCount: 4,
  };

  it("renders loading state when summary is null or loading is true", () => {
    const { getByText } = render(
      <PaperProvider theme={theme}>
        <SummaryBanner summary={null} loading={true} />
      </PaperProvider>,
    );
    expect(getByText("Loading summary...")).toBeTruthy();
  });

  it("renders monthly totals and breakdown including contribution amount", () => {
    const { getByText } = render(
      <PaperProvider theme={theme}>
        <SummaryBanner summary={mockSummary} loading={false} />
      </PaperProvider>,
    );

    // Total monthly sum = 15000 + 5000 = 20000 -> ₹20.00K (excluding contributions)
    expect(getByText("This Month")).toBeTruthy();
    expect(getByText("₹20.00K")).toBeTruthy();

    // Breakdown items
    expect(getByText("Works: ₹15.00K")).toBeTruthy();
    expect(getByText("Expenses: ₹5.00K")).toBeTruthy();
    // Contributions badge opposite to total
    expect(getByText("Contribs")).toBeTruthy();
    expect(getByText("+₹3.00K")).toBeTruthy();

    // Counts row
    expect(getByText("12 Works")).toBeTruthy();
    expect(getByText("8 Expenses")).toBeTruthy();
    expect(getByText("4 Contribs")).toBeTruthy();
  });
});
