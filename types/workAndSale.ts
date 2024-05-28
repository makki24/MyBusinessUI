import { User } from "./users";
import { WorkType } from "./work";
import { Tag } from "./tag";

export interface WorkAndSale {
  sender: User;
  receiver: User[];
  type?: WorkType;
  quantity?: number;
  description?: string;
  pricePerUnit?: number;
  amount?: number;
  tags: Tag[];
  date?: Date;
}
