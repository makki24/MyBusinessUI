// In a new file, e.g., atoms.ts
import { atom } from 'recoil';
import {Role} from "../types";

export const rolesState = atom({
    key: 'rolesState',
    default: [] as Role[],
});
