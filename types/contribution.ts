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