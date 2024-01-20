import { Tag } from "./tag";
import {User} from "./users";

export interface ExpenseType {
    id?: string;
    name: string;
    isReceivingUser?: boolean
}

export interface Expense {
    id?: number;
    date: Date;
    amount: number;
    sender: User;
    receiver?: User;
    tags: Tag[]
    description?: string;
    type: ExpenseType;
}