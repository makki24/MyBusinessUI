import { atom } from "recoil";
import { WorkAndSale } from "../../../types";

export const middleManState = atom({
  key: "middleMan",
  default: {} as WorkAndSale,
});

export const workAndSalesState = atom({
  key: "workAndSale",
  default: [] as WorkAndSale[],
});
