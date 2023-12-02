import {User} from "./users";

export interface ExpenseType {
    id: string;
    expenseTypeName: string;
}

export interface Expense {
    id?: number;
    date: Date;
    user: User;
    amount: number;
    additionalInfo?: string;
    expenseType: ExpenseType;
}