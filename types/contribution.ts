import { User } from "./users";
import { Tag } from "./tag";

export interface Contribution {
  id?: number;
  date: Date;
  amount: number;
  sender?: User;
  receiver: User;
  tags: Tag[];
  description?: string;
}

export interface LoanToHoldingTransaction {
  id?: number;
  user?: User;
  amount: number;
  createdBy: User;
  date: Date;
}
