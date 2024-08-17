import { Tag } from "./tag";

export abstract class BaseTransactionType {
  id?: number;
  name: string;
  type?: "work" | "expense";
  defaultTags: Tag[];
}
