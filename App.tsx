// App.tsx
import "react-native-gesture-handler"; // Must be at the very top
import "react-native-reanimated";
import React from "react";
import { useColorScheme } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { RecoilRoot } from "recoil";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppContent from "./src/components/AppContent";
import { enGB, registerTranslation } from "react-native-paper-dates";
registerTranslation("en-GB", enGB);

import { theme, darkTheme } from "./src/styles/theme";

const App = () => {
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === "dark" ? darkTheme : theme;

  return (
    <GestureHandlerRootView style={{ height: "100%", width: "100%" }}>
      <RecoilRoot>
        <PaperProvider theme={currentTheme}>
          <BottomSheetModalProvider>
            <AppContent />
          </BottomSheetModalProvider>
        </PaperProvider>
      </RecoilRoot>
    </GestureHandlerRootView>
  );
};

export default App;
