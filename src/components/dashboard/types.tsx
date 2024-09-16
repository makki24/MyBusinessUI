import { BaseTransactionType, User } from "../../../types";

export interface TransactionSummaryByType {
  baseTransactionType: BaseTransactionType;
  totalAmount: number;
  totalQuantity: number;
  receiver: User;
  subTransactions: TransactionSummaryByType[];
}
