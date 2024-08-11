import { BaseTransactionType } from "../../../types";

export interface TransactionSummaryByType {
  baseTransactionType: BaseTransactionType;
  totalAmount: number;
  totalQuantity: number;
}
