import { MD3LightTheme as DefaultTheme } from "react-native-paper";
import {
  PRIMARY,
  SECONDARY,
  BACKGROUND,
  SURFACE,
  ERROR,
  TEXT_PRIMARY,
} from "./colors";
import { BORDER_RADIUS } from "./constants";

export const theme = {
  ...DefaultTheme,
  roundness: BORDER_RADIUS,
  colors: {
    ...DefaultTheme.colors,
    primary: PRIMARY,
    secondary: SECONDARY,
    background: BACKGROUND,
    surface: SURFACE,
    error: ERROR,
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onSurface: TEXT_PRIMARY,
    onBackground: TEXT_PRIMARY,
    elevation: {
      level0: "transparent",
      level1: SURFACE,
      level2: SURFACE,
      level3: SURFACE,
      level4: SURFACE,
      level5: SURFACE,
    },
  },
};
