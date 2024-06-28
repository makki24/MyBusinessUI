import { User } from "../../../types";

export interface Range {
  startDate: Date;
  endDate: Date;
}

export interface ReportSummaryModel {
  range: Range;
  user: User;
}

export interface UserSummary {
  toPay: string;
  totalSent: string;
  totalReceived: string;
}
