import { Filter, User, WorkType } from "../../../../types";

export interface BatchEditState {
  user: User;
  type: WorkType;
}

export interface BatchEditPayload {
  pricePerUnit: number;
  filter: Filter;
}
