import { BaseTransactionType, User } from "../../../types";

export interface Range {
  startDate: Date;
  endDate: Date;
}

export interface ReportSummaryModel {
  range: Range;
  user: User;
}

export interface UserSummaryByType {
  type: BaseTransactionType;
  amount: number;
}
