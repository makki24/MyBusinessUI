import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface QuickAction {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        variant="titleSmall"
        style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}
      >
        Quick Actions
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pill,
              {
                backgroundColor: `${action.color}15`,
                borderColor: `${action.color}30`,
              },
            ]}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={action.icon}
              size={20}
              color={action.color}
            />
            <Text style={[styles.pillText, { color: action.color }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default QuickActions;
