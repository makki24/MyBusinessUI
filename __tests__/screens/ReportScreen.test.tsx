import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react-native";
import ReportScreen from "../../screens/ReportScreen";
import { PaperProvider } from "react-native-paper";
import { RecoilRoot } from "recoil";
import ReportService from "../../services/ReportService";
import { tagsState } from "../../recoil/atom";

// Mock ReportService
jest.mock("../../services/ReportService", () => ({
  getReport: jest.fn(),
  downloadReport: jest.fn(),
}));

jest.mock(
  "../../src/components/common/CustomDateRange",
  () => "CustomDateRange",
);

// Mock CustomDropdown to expose a button that calls setValue
jest.mock("../../components/common/CustomDropdown", () => {
  const MockDropdown = (props: {
    setValue: (value: number) => void;
    testID: string;
    placeholder?: string;
  }) => {
    const { View, Button } = jest.requireActual("react-native");
    return (
      <View testID={props.testID}>
        <Button
          title={props.placeholder || "Select Tag"}
          onPress={() => props.setValue(1)}
        />
      </View>
    );
  };
  MockDropdown.displayName = "MockCustomDropdown";
  return MockDropdown;
});

interface StyleObject {
  display?: string;
}

describe("ReportScreen", () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  const setup = (mockReportData: {
    totalSaleAmount: number;
    totalContributionAmount: number;
    totalExpenseAmount: number;
    totalWorkAmount: number;
  }) => {
    (ReportService.getReport as jest.Mock).mockResolvedValue(mockReportData);

    const tags = [{ id: 1, name: "Test Tag" }];

    const { getByText, getByTestId } = render(
      <RecoilRoot initializeState={(snapshot) => snapshot.set(tagsState, tags)}>
        <PaperProvider>
          {/* @ts-expect-error Testing with partial navigation mock */}
          <ReportScreen navigation={{ navigate: jest.fn() }} />
        </PaperProvider>
      </RecoilRoot>,
    );

    return { getByText, getByTestId };
  };

  it("should display Profit (Green Icon) when result is Zero", async () => {
    // 100 - (50 + 50) = 0
    const mockData = {
      totalSaleAmount: 100,
      totalContributionAmount: 0,
      totalExpenseAmount: 50,
      totalWorkAmount: 50,
    };

    const { getByText, getByTestId } = setup(mockData);

    // Select Tag
    fireEvent.press(getByText("Select Tags"));

    // Click "See Report"
    fireEvent.press(getByText("See Report"));

    await waitFor(() => {
      expect(ReportService.getReport).toHaveBeenCalled();
    });

    // Wait for elements to appear
    await waitFor(() => {
      getByTestId("profit-icon-container");
      getByTestId("loss-icon-container", { includeHiddenElements: true });
    });

    const profitContainer = getByTestId("profit-icon-container");
    const lossContainer = getByTestId("loss-icon-container", {
      includeHiddenElements: true,
    });

    // Check styles to see if hidden
    // We expect Profit (Green) to NOT have display: none
    const isProfitHidden = profitContainer.props.style.some(
      (s: StyleObject) => s && s.display === "none",
    );
    // We expect Loss (Red) TO have display: none
    const isLossHidden = lossContainer.props.style.some(
      (s: StyleObject) => s && s.display === "none",
    );

    expect(isProfitHidden).toBeFalsy(); // Should show profit icon
    expect(isLossHidden).toBeTruthy(); // Should hide loss icon
  });
});
