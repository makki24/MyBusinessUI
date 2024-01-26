import { Tag } from "./tag";
import {User} from "./users";


export interface WorkType {
    id?: number;
    name: string;
    unit: string;
    pricePerUnit?: number;
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



