// src/components/ReportItem.test.tsx

import React from "react";
import { render } from "@testing-library/react-native";
import ReportItem from "../../components/ReportItem";
import { User, UserReport } from "../../types";

jest.mock("../../src/components/common/ProfilePicture", () => "ProfilePicture");

const makeReport = (overrides: Partial<UserReport> = {}): UserReport => ({
  id: 1,
  date: new Date("2026-01-15"),
  sent: "500",
  received: "300",
  type: "Work",
  description: "Test description",
  transactionType: null,
  totalSent: 1000,
  totalReceived: 1500,
  sender: { id: 1, name: "Alice" } as unknown as User,
  receiver: { id: 2, name: "Bob" } as unknown as User,
  ...overrides,
});

describe("<ReportItem />", () => {
  it("renders the transaction type and receiver name", () => {
    const report = makeReport();
    const { getByText } = render(<ReportItem reportData={report} />);

    expect(getByText(/Work/)).toBeTruthy();
    expect(getByText(/to Bob/)).toBeTruthy();
  });

  it("renders the date", () => {
    const report = makeReport();
    const { getByText } = render(<ReportItem reportData={report} />);

    expect(getByText(report.date.toDateString())).toBeTruthy();
  });

  it("renders description when present", () => {
    const report = makeReport({ description: "Payment for materials" });
    const { getByText } = render(<ReportItem reportData={report} />);

    expect(getByText("Payment for materials")).toBeTruthy();
  });

  it("does not render description when empty", () => {
    const report = makeReport({ description: "" });
    const { queryByText } = render(<ReportItem reportData={report} />);

    expect(queryByText("Payment for materials")).toBeNull();
  });

  it("renders total sent and total received", () => {
    const report = makeReport({ totalSent: 2000, totalReceived: 3000 });
    const { getByText } = render(<ReportItem reportData={report} />);

    expect(getByText("T S 2000")).toBeTruthy();
    expect(getByText("T R 3000")).toBeTruthy();
  });

  it("renders balance label", () => {
    const report = makeReport();
    const { getByText } = render(<ReportItem reportData={report} />);

    expect(getByText("Balance")).toBeTruthy();
  });

  it("renders formatted balance amount", () => {
    const report = makeReport({ totalSent: 1000, totalReceived: 1500 });
    const { getByText } = render(<ReportItem reportData={report} />);

    // Balance = |1500 - 1000| = 500, formatted as INR
    const formatted = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "INR",
    }).format(500);
    expect(getByText(formatted)).toBeTruthy();
  });

  it("shows sender name when received", () => {
    // received in ReportItem = !reportData.received
    // CardItem gets received = !received = !!reportData.received
    // So when reportData.received is truthy, "from sender" shows
    const report = makeReport({
      received: "300",
      sender: { id: 1, name: "Charlie" } as unknown as User,
    });
    const { getByText } = render(<ReportItem reportData={report} />);

    expect(getByText(/from Charlie/)).toBeTruthy();
  });
});
