// components/common/LoadingError.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";

interface LoadingErrorProps {
  error: string | null;
  isLoading: boolean;
}

const LoadingError = ({ error, isLoading }: LoadingErrorProps) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          animating={true}
          color={theme.colors.primary}
          size="large"
        />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          {
            backgroundColor: theme.colors.errorContainer || "#FFEBEE",
            borderLeftColor: theme.colors.error,
          },
        ]}
      >
        <Text
          style={[
            styles.errorText,
            {
              color:
                theme.colors.onErrorContainer ||
                theme.colors.error ||
                "#B71C1C",
            },
          ]}
        >
          {error}
        </Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    padding: 15,
    margin: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});

export default LoadingError;
