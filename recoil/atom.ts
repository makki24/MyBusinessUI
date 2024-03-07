// In a new file, e.g., atoms.ts
import { atom } from "recoil";
import {
  Expense,
  ExpenseType,
  Role,
  User,
  WorkType,
  Work,
  Sale,
  Tag,
  Contribution,
  UserReport,
  LoanToHoldingTransaction,
} from "../types";

export const rolesState = atom({
  key: "rolesState",
  default: [] as Role[],
});

export const expenseTypesState = atom({
  key: "expenseTypesState",
  default: [] as ExpenseType[],
});

export const expensesState = atom({
  key: "expensesState",
  default: [] as Expense[],
});

export const userState = atom({
  key: "userState", // unique ID (with respect to other atoms/selectors)
  default: null as User | null, // default value (aka initial value)
});

export const usersState = atom({
  key: "usersState", // unique ID (with respect to other atoms/selectors)
  default: [] as User[],
});

export const tagsState = atom({
  key: "tagsState", // unique ID (with respect to other atoms/selectors)
  default: [] as Tag[],
});

export const workTypesState = atom({
  key: "workTypesState", // unique ID (with respect to other atoms/selectors)
  default: [] as WorkType[],
});

export const worksState = atom({
  key: "worksState", // unique ID (with respect to other atoms/selectors)
  default: [] as Work[],
});

export const salesState = atom({
  key: "salesState", // unique ID (with respect to other atoms/selectors)
  default: [] as Sale[],
});

export const contributionsState = atom({
  key: "contributionsState", // unique ID (with respect to other atoms/selectors)
  default: [] as Contribution[],
});

export const userReportsState = atom({
  key: "userReportsState", // unique ID (with respect to other atoms/selectors)
  default: [] as UserReport[],
});

export const loanToHoldingTransactionState = atom({
  key: "loanToHoldingTransactionState", // unique ID (with respect to other atoms/selectors)
  default: [] as LoanToHoldingTransaction[],
});
