import React from "react";
import { View, Text } from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";

interface LoadingErrorProps {
  error: string | null;
  isLoading: boolean;
}

const LoadingError = ({ error, isLoading }: LoadingErrorProps) => {
  const theme = useTheme();

  // Sanitize Error Message (Backend Hibernate/Lazy Initialization)
  const displayError =
    error &&
    (error.includes("could not write JSON") ||
      error.includes("lazily initialize") ||
      error.includes("no Session"))
      ? "A temporary server error occurred. Please try again or contact support."
      : error;

  if (isLoading) {
    return (
      <View
        style={{ padding: 20, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator
          animating={true}
          color={theme.colors.primary}
          size="large"
        />
      </View>
    );
  }

  if (displayError) {
    return (
      <View
        style={{
          padding: 15,
          margin: 15,

          // Use a soft red/pink background for error
          backgroundColor: theme.colors.errorContainer || "#FFEBEE",
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.error,
          flexDirection: "row",
          alignItems: "center",
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text
          style={{
            color:
              theme.colors.onErrorContainer || theme.colors.error || "#B71C1C",
            fontSize: 14,
            fontWeight: "500",
            flex: 1,
          }}
        >
          {displayError}
        </Text>
      </View>
    );
  }

  return null;
};

export default LoadingError;
