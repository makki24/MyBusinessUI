import { ActivityIndicator } from "react-native";
import React from "react";
import { useTheme } from "react-native-paper";

const Loading = () => {
  const theme = useTheme();

  return (
    <ActivityIndicator
      size="large"
      color={theme.colors.primary}
      animating={true}
    />
  );
};

export default Loading;
