import { Work } from "./work";
import { Sale } from "./Sale";

export interface WorkAndSale {
  works: Work[];
  sale: Sale;
  id?: number;
}
