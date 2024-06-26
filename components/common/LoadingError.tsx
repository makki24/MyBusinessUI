import { View, useColorScheme } from "react-native";
import commonStyles from "../../src/styles/commonStyles";
import React from "react";
import { MD3DarkTheme, MD3LightTheme, Text } from "react-native-paper";
import Loading from "../../src/components/common/Loading";

type LoadingErrorProps = {
  isLoading: boolean;
  error: string;
};

const LoadingError: React.FC<LoadingErrorProps> = ({ isLoading, error }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;

  return (
    <>
      {error && (
        <View
          style={{
            ...commonStyles.errorContainer,
            backgroundColor: theme.colors.errorContainer,
          }}
        >
          <Text style={{ color: theme.colors.error }}>{error}</Text>
        </View>
      )}
      {isLoading && (
        <View style={commonStyles.loadingContainer}>
          <Loading />
        </View>
      )}
    </>
  );
};

export default LoadingError;
