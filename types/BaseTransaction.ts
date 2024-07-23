export abstract class BaseTransactionType {
  id?: number;
  name: string;
  type?: "work" | "expense";
}
