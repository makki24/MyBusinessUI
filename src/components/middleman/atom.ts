import { atom } from "recoil";
import { WorkAndSale } from "../../../types";

const workAndSaleState = atom({
  key: "workAndSale",
  default: {} as WorkAndSale,
});

export default workAndSaleState;
