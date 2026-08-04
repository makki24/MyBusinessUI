// src/components/ExpenseItem.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme, Chip } from "react-native-paper";
import { Expense } from "../types";
import { Swipeable } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ExpenseItemProps {
  expense: Expense;
  onPress: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

const formatAmount = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onPress,
  onDelete,
  canDelete = false,
}) => {
  const theme = useTheme();

  const title = expense.type.isReceivingUser
    ? `${expense.type.name} → ${expense.receiver?.name}`
    : expense.type.name;

  const renderRightActions = () => {
    if (!canDelete || !onDelete) return null;
    return (
      <TouchableOpacity style={styles.deleteAction} onPress={onDelete}>
        <MaterialCommunityIcons name="delete-outline" size={24} color="#fff" />
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      <TouchableOpacity
        style={[
          styles.itemContainer,
          { backgroundColor: theme.colors.surface },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="wallet" size={20} color="#FF9800" />
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemHeaderRow}>
            <Text
              variant="bodyMedium"
              style={{ fontWeight: "600", flex: 1 }}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ fontWeight: "700", color: theme.colors.primary }}
            >
              {formatAmount(expense.amount)}
            </Text>
          </View>
          <View style={styles.itemSubRow}>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}
              numberOfLines={1}
            >
              {expense.sender?.name}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              {formatRelativeTime(new Date(expense.date))}
            </Text>
          </View>
          {expense.description ? (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.outline, marginTop: 4 }}
              numberOfLines={2}
            >
              {expense.description}
            </Text>
          ) : null}
          {expense.tags && expense.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {expense.tags.map((tag) => (
                <Chip
                  key={tag.id}
                  style={styles.tagChip}
                  textStyle={{ fontSize: 10, marginVertical: 0 }}
                >
                  {tag.name}
                </Chip>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF980015",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    justifyContent: "center",
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 4,
  },
  tagChip: {
    height: 24,
    backgroundColor: "rgba(255, 152, 0, 0.1)",
  },
  deleteAction: {
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: "100%",
    borderRadius: 12,
    marginLeft: 8,
    marginBottom: 8,
  },
});

export default ExpenseItem;
