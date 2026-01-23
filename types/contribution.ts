import { User } from "./users";
import { Tag } from "./tag";

export interface Contribution {
  id?: number;
  date: Date;
  amount: number;
  receiver: User;
  tags: Tag[];
  sender?: User;
  quantity: number;
  pricePerUnit: number;
  description?: string;
}

export interface LoanToHoldingTransaction {
  id?: number;
  user?: User;
  amount: number;
  createdBy: User;
  date: Date;
}
