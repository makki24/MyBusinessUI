// In a new file, e.g., atoms.ts
import { atom } from 'recoil';
import {Expense, ExpenseType, Role, User} from "../types";

export const rolesState = atom({
    key: 'rolesState',
    default: [] as Role[],
});

export const expenseTypesState = atom({
    key: 'expenseTypesState',
    default: [] as ExpenseType[],
});

export const expensesState = atom({
    key: 'expensesState',
    default: [] as Expense[],
});

export const userState = atom({
    key: 'userState', // unique ID (with respect to other atoms/selectors)
    default: null as User | null, // default value (aka initial value)
});

export const usersState = atom({
    key: 'usersState', // unique ID (with respect to other atoms/selectors)
    default: [] as User[],
});