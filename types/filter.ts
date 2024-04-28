import { Tag, User } from "./index";

export interface Filter {
  fromDate?: Date;
  toDate?: Date;
  user: User[];
  sender: User[];
  receiver: User[];
  tags: Tag[];
  lastUpdateTime?: Date;
}

export type SortableProperties =
  | "date"
  | "user.name"
  | "sender"
  | "receiver"
  | "amount"
  | "type.name";

export interface Sort {
  property: SortableProperties;
  direction: "asc" | "desc";
}

export interface FilterAndSort {
  filter: Filter;
  sort: Sort[];
}
