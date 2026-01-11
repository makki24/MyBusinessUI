import React from "react";
import { render, waitFor, screen } from "@testing-library/react-native";
import UserReportScreen from "../../screens/UserReportScreen";
import { RecoilRoot } from "recoil";
import { Provider as PaperProvider } from "react-native-paper";

// Mock ReportService
jest.mock("../../services/ReportService", () => ({
    getReportByUser: jest.fn(() => Promise.resolve([
        { id: 1, date: new Date().toISOString(), amount: 100, type: "EXPENSE" }
    ])),
}));

jest.mock("../../src/components/common/LoadingError", () => "LoadingError");
jest.mock("../../src/components/common/Loading", () => "Loading");
jest.mock("../../src/components/common/NumberInput", () => "NumberInput");
jest.mock("../../src/components/common/SwitchInputDynamicLabel", () => "SwitchInputDynamicLabel");
jest.mock("../../components/ReportItem", () => "ReportItem");

describe("UserReportScreen", () => {
    it("renders correctly with userId", async () => {
        const route = { params: { userId: 1 } };

        render(
            <RecoilRoot>
                <PaperProvider>
                    {/* @ts-ignore */}
                    <UserReportScreen route={route} navigation={{} as any} />
                </PaperProvider>
            </RecoilRoot>
        );

        // Should load data. The list might be empty initially or show loading.
        // We check if it DOES NOT show "No user ID provided"
        expect(screen.queryByText("No user ID provided")).toBeNull();
    });

    it("handles missing userId gracefuly", () => {
        const route = { params: {} };
        render(
            <RecoilRoot>
                <PaperProvider>
                    {/* @ts-ignore */}
                    <UserReportScreen route={route} navigation={{} as any} />
                </PaperProvider>
            </RecoilRoot>
        );
        expect(screen.getByText("No user ID provided")).toBeTruthy();
    });
});
