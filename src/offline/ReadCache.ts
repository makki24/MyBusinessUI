/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEYS = {
  USERS: "@cache_users",
  WORK_TYPES: "@cache_work_types",
  TAGS: "@cache_tags",
  EXPENSE_TYPES: "@cache_expense_types",
  LAST_REFRESH: "@cache_last_refresh",
};

export const ReadCache = {
  /**
   * Cache all reference data. Call on app start when online.
   */
  refreshAll: async (
    users: any[],
    workTypes: any[],
    tags: any[],
    expenseTypes: any[],
  ): Promise<void> => {
    await Promise.all([
      AsyncStorage.setItem(CACHE_KEYS.USERS, JSON.stringify(users)),
      AsyncStorage.setItem(CACHE_KEYS.WORK_TYPES, JSON.stringify(workTypes)),
      AsyncStorage.setItem(CACHE_KEYS.TAGS, JSON.stringify(tags)),
      AsyncStorage.setItem(
        CACHE_KEYS.EXPENSE_TYPES,
        JSON.stringify(expenseTypes),
      ),
      AsyncStorage.setItem(CACHE_KEYS.LAST_REFRESH, new Date().toISOString()),
    ]);
  },

  getUsers: async (): Promise<any[] | null> => {
    const raw = await AsyncStorage.getItem(CACHE_KEYS.USERS);
    return raw ? JSON.parse(raw) : null;
  },

  getWorkTypes: async (): Promise<any[] | null> => {
    const raw = await AsyncStorage.getItem(CACHE_KEYS.WORK_TYPES);
    return raw ? JSON.parse(raw) : null;
  },

  getTags: async (): Promise<any[] | null> => {
    const raw = await AsyncStorage.getItem(CACHE_KEYS.TAGS);
    return raw ? JSON.parse(raw) : null;
  },

  getExpenseTypes: async (): Promise<any[] | null> => {
    const raw = await AsyncStorage.getItem(CACHE_KEYS.EXPENSE_TYPES);
    return raw ? JSON.parse(raw) : null;
  },

  getLastRefresh: async (): Promise<string | null> => {
    return AsyncStorage.getItem(CACHE_KEYS.LAST_REFRESH);
  },
};
