import { Tag } from "./tag";
import { User } from "./users";
import { BaseTransactionType } from "./BaseTransaction";

export interface ExpenseType extends BaseTransactionType {
  id?: number;
  name: string;
  isReceivingUser?: boolean;
}

export interface Expense {
  id?: number;
  date: Date;
  amount: number;
  sender: User;
  receiver?: User;
  tags: Tag[];
  description?: string;
  type: ExpenseType;
  currency?: string;
}
