import { Tag } from "./tag";
import { User } from "./users";
import { BaseTransactionType } from "./BaseTransaction";

export interface WorkType extends BaseTransactionType {
  id?: number;
  name: string;
  unit: string;
  pricePerUnit?: number;
  enterAmountDirectly: boolean;
}

export interface Work {
  id?: number;
  date: Date;
  type: WorkType; // Assuming ExpenseType is another interface or type
  quantity: number;
  pricePerUnit: number;
  amount: number;
  user: User; // Assuming User is another interface or type
  description?: string;
  tags: Tag[]; // Assuming Tag is another interface or type
}
