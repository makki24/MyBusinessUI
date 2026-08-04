import React from "react";
import { render, waitFor, screen } from "@testing-library/react-native";
import UserSummary from "../../../src/components/users/UserSummary";
import { RecoilRoot } from "recoil";
import { Provider as PaperProvider } from "react-native-paper";

// Mock dependencies
jest.mock("../../../src/components/users/UserService", () => ({
  getSummaryByUser: jest.fn(() =>
    Promise.resolve({
      received: [],
      sent: [],
    }),
  ),
  sendSummaryToMail: jest.fn(() => Promise.resolve("Email sent")),
}));

jest.mock(
  "../../../src/components/common/UserRemainingAmount",
  () => "UserRemainingAmount",
);
jest.mock("../../../src/components/common/LoadingError", () => "LoadingError");
jest.mock(
  "../../../src/components/common/CustomDateRange",
  () => "CustomDateRange",
);

const mockUser = {
  id: 1,
  name: "Test User",
  phoneNumber: "1234567890",

  amountToPay: 0,
};

describe("UserSummary Screen", () => {
  it("renders correctly with user params", async () => {
    const route = { params: { user: mockUser } };

    render(
      <RecoilRoot>
        <PaperProvider>
          {/* @ts-expect-error Testing with partial route mock */}
          <UserSummary route={route} />
        </PaperProvider>
      </RecoilRoot>,
    );

    // Should show the email action and To Pay/Receive toggle
    await waitFor(() => {
      expect(screen.getByText("Send full report to mail")).toBeTruthy();
    });
  });

  it("handles missing user params gracefully", () => {
    const route = { params: {} }; // No user

    render(
      <RecoilRoot>
        <PaperProvider>
          {/* @ts-expect-error Testing with partial route mock missing user */}
          <UserSummary route={route} />
        </PaperProvider>
      </RecoilRoot>,
    );

    expect(screen.getByText("No user data provided.")).toBeTruthy();
  });
});
