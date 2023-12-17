import { Tag } from "./tag";
import {User} from "./users";


export interface WorkType {
    id?: number;
    workTypeName: string;
    unit: string;
    defaultValuePerUnit?: number;
}


export interface Work {
    workID?: number;
    quantity: number;
    pricePerUnit: number;
    amount: number;
    description?: string;
    workType: WorkType; // Assuming ExpenseType is another interface or type
    user: User; // Assuming User is another interface or type
    tags: Tag[]; // Assuming Tag is another interface or type
    date: Date;
}



