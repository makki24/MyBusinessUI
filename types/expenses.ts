import { Tag } from "./tag";
import {User} from "./users";

export interface ExpenseType {
    id?: string;
    expenseTypeName: string;
    isReceivingUser?: boolean
}

export interface Expense {
    id?: number;
    date: Date;
    user: User;
    amount: number;
    additionalInfo?: string;
    expenseType: ExpenseType;
    receivingUser?: User;
    tags: Tag[]
}