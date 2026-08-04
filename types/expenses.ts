import { Tag } from "./tag";
import { User } from "./users";
import { BaseTransactionType } from "./BaseTransaction";
import { WorkType } from "./work";

export interface ExpenseType extends BaseTransactionType {
  id?: number;
  name: string;
  isReceivingUser?: boolean;
}

export type PaymentPurpose = "ADVANCE" | "ADHOC" | "SETTLEMENT";

export interface Expense {
  id?: number;
  date: Date;
  amount: number;
  sender: User;
  receiver?: User;
  tags: Tag[];
  description?: string;
  type: ExpenseType;
  workType?: WorkType;
  paymentPurpose?: PaymentPurpose;
}
