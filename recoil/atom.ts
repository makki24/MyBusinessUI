// In a new file, e.g., atoms.ts
import { atom } from 'recoil';
import {ExpenseType, Role} from "../types";

export const rolesState = atom({
    key: 'rolesState',
    default: [] as Role[],
});

export const expenseTypesState = atom({
    key: 'expenseTypesState',
    default: [] as ExpenseType[],
});