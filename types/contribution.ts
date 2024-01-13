import {User} from "./users";
import {Tag} from "./tag";

export interface Contribution {
    id?: number;
    amount: number;
    sendingMember?: User;
    receivingManager: User;
    date: Date;
    tags: Tag[];
}

export interface LoanToHoldingTransaction {
    id?: number;
    user?: User;
    amount: number;
    createdBy: User;
    date: Date;
}