import type { PathConfigMap } from "@react-navigation/core";

interface ParamList {}

export const LinkingConfig: {
  screens: PathConfigMap<ParamList>;
} = {
  screens: {
    HomeStack: {
      screens: {
        AdminScreen: "admin",
      },
    },
    ExpenseStack: {
      screens: {
        Expenses: "expenses",
      },
    },
  },
  // Configuration for linking
};
