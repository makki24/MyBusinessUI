// recoil/selectors/userSelectors.ts
import { selector } from "recoil";
import { userState, usersState } from "../atom";
import { User } from "../../types";

export const otherUsersState = selector({
  key: "otherUsersState",
  get: ({ get }): User[] => {
    const allUsers = get(usersState);
    const currentUser = get(userState);
    return allUsers.filter((user) => user.id !== currentUser?.id);
  },
});
