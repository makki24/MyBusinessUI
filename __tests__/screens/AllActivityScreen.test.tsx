import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import AllActivityScreen from "../../screens/AllActivityScreen";
import { RecentActivityItem } from "../../src/components/home/RecentActivityFeed";
import { PaperProvider } from "react-native-paper";
import DashboardService, {
  RecentActivity,
} from "../../services/DashboardService";

jest.mock("../../services/DashboardService", () => ({
  getRecent: jest.fn(),
}));

jest.mock("expo-notifications", () => ({
  getLastNotificationResponseAsync: jest.fn(() => Promise.resolve(null)),
}));

describe("AllActivityScreen & RecentActivityItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockActivityWithDetails: RecentActivity = {
    id: 1,
    type: "EXPENSE",
    title: "Mazori",
    subtitle: "Ali",
    amount: 500,
    date: new Date().toISOString(),
    metadata: {
      description: "Payment for field work",
      tags: ["Urgent", "FieldWork"],
    },
  };

  it("renders activity item with description and tags", () => {
    render(
      <PaperProvider>
        <RecentActivityItem
          item={mockActivityWithDetails}
          onPress={jest.fn()}
        />
      </PaperProvider>,
    );

    expect(screen.getByText("Mazori")).toBeTruthy();
    expect(screen.getByText("₹500")).toBeTruthy();
    expect(screen.getByText("💬 Payment for field work")).toBeTruthy();
    expect(screen.getByText("Urgent")).toBeTruthy();
    expect(screen.getByText("FieldWork")).toBeTruthy();
  });

  it("fetches and displays activities in AllActivityScreen", async () => {
    (DashboardService.getRecent as jest.Mock).mockResolvedValue([
      mockActivityWithDetails,
    ]);

    const navigation = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
    };

    render(
      <PaperProvider>
        {/* @ts-expect-error Partial navigation mock */}
        <AllActivityScreen navigation={navigation} />
      </PaperProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Mazori")).toBeTruthy();
      expect(screen.getByText("💬 Payment for field work")).toBeTruthy();
      expect(screen.getByText("Urgent")).toBeTruthy();
      expect(screen.getByText("FieldWork")).toBeTruthy();
    });
  });
});
