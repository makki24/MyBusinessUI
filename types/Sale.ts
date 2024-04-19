import { User } from "./users";
import { Tag } from "./tag";

export interface Sale {
  id?: number;
  date: Date;
  quantity: number;
  pricePerUnit: number;
  amount: number;
  user: User;
  description: string;
  tags: Tag[];
}
