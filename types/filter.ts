import { Tag, User } from "./index";

export interface Filter {
  fromDate?: Date;
  toDate?: Date;
  user: User[];
  sender: User[];
  receiver: User[];
  tags: Tag[];
}
