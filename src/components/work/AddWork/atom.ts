import { atom } from "recoil";
import { User } from "../../../../types";

export const selectedUserForAddWorkState = atom<User>({
  key: "selectedUserForAddWorkState",
  default: null,
});
