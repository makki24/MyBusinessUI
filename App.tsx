// App.tsx
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { RecoilRoot } from "recoil";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppContent from "./src/components/AppContent";
import { enGB, registerTranslation } from "react-native-paper-dates";
registerTranslation("en-GB", enGB);

import { theme } from "./src/styles/theme";

const App = () => {
  return (
    <GestureHandlerRootView style={{ height: "100%", width: "100%" }}>
      <RecoilRoot>
        <PaperProvider theme={theme}>
          <BottomSheetModalProvider>
            <AppContent />
          </BottomSheetModalProvider>
        </PaperProvider>
      </RecoilRoot>
    </GestureHandlerRootView>
  );
};

export default App;
