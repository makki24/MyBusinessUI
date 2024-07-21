import { User } from "./users";
import { BaseTransactionType } from "./BaseTransaction";

export interface ExpenseReport {
  totalWorkAmount: number;
  totalExpenseAmount: number;
  totalSaleAmount: number;
  totalContributionAmount: number;
}

export interface UserReport {
  date: Date;
  id: number;
  sent: string;
  received: string;
  type: string;
  description: string;
  transactionType: BaseTransactionType;
  totalSent: number;
  totalReceived: number;
  sender: User;
  receiver: User;
}
