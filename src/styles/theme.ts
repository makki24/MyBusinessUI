import {
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme,
} from "react-native-paper";
import {
  PRIMARY,
  SECONDARY,
  ACCENT,
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
export const darkTheme = {
  ...MD3DarkTheme,
  roundness: BORDER_RADIUS,
  colors: {
    ...MD3DarkTheme.colors,
    primary: ACCENT,
    onPrimary: "#000000",
    secondary: SECONDARY,
    // We let MD3DarkTheme handle surface and text colors so they adapt correctly in dark mode
  },
};
