import {User} from "./users";
import {Tag} from "./tag";

export enum SaleType {
    sales = 'CONTRIBUTION',
    type2 = 'TYPE2'
}
export interface Sale {
    id?: number;
    date: Date;
    type: SaleType;
    quantity: number;
    pricePerUnit: number
    amount: number;
    user: User;
    description: string;
    tags: Tag[];
}