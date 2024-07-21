import { atom } from "recoil";
import { BatchEditState } from "./types";

export const batchEditPayloadState = atom({
  key: "batchEditPayload",
  default: {} as BatchEditState,
});
