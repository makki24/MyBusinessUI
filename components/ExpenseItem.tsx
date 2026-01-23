// src/components/ExpenseItem.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { Expense } from "../types";
import commonItemStyles from "../src/styles/commonItemStyles";
import UserDetails from "./common/UserDetails";
import Labels from "./common/Labels";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ExpenseItemProps {
  expense: Expense;
  onPress: () => void;
  onDelete: () => void;
  canDelete?: boolean;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onPress,
  onDelete,
  canDelete = false,
}) => {
  const theme = useTheme();

  return (
    <Card
      style={[commonItemStyles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Card.Content style={styles.cardContent}>
        {/* Header Row: Expense Type + Delete Button */}
        <View style={styles.headerRow}>
          <Text
            variant="titleMedium"
            style={[styles.expenseType, { flex: 1 }]}
            numberOfLines={2}
          >
            {expense.type.isReceivingUser && expense.receiver
              ? `${expense.type.name} to ${expense.receiver.name}`
              : expense.type.name}
          </Text>

          {/* Delete Button - Top Right */}
          {canDelete && (
            <TouchableOpacity
              style={[
                styles.deleteButton,
                { backgroundColor: theme.colors.errorContainer },
              ]}
              onPress={(e) => {
                e?.stopPropagation?.();
                onDelete();
              }}
              accessibilityLabel="Delete expense"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="delete"
                size={18}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* User Details on new line */}
        {expense.sender && (
          <View style={styles.userRow}>
            <UserDetails user={expense.sender} compact />
          </View>
        )}

        {/* Date and Time Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="calendar"
              size={14}
              color={theme.colors.onSurfaceVariant}
              style={styles.infoIcon}
            />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {expense.date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={theme.colors.onSurfaceVariant}
              style={styles.infoIcon}
            />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {expense.date.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {/* Amount Row */}
        <View style={styles.amountRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="cash"
              size={16}
              color={theme.colors.primary}
              style={styles.infoIcon}
            />
            <Text variant="bodyLarge" style={styles.amount}>
              {new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "INR",
              }).format(expense.amount)}
            </Text>
          </View>
        </View>

        {/* Description Row - Separate from amount */}
        {expense.description && (
          <View style={styles.descriptionRow}>
            <MaterialCommunityIcons
              name="text"
              size={14}
              color={theme.colors.onSurfaceVariant}
              style={styles.infoIcon}
            />
            <Text
              variant="bodySmall"
              style={[
                styles.description,
                { color: theme.colors.onSurfaceVariant },
              ]}
              numberOfLines={2}
            >
              {expense.description}
            </Text>
          </View>
        )}

        {/* Tags */}
        {expense.tags.length > 0 && (
          <View style={styles.tagsRow}>
            <Labels label={"Tags"} items={expense.tags} />
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  expenseType: {
    fontWeight: "600",
    marginRight: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  userRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 4,
  },
  amountRow: {
    marginTop: 12,
  },
  amount: {
    fontWeight: "700",
    fontSize: 18,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  description: {
    flex: 1,
  },
  tagsRow: {
    marginTop: 8,
  },
});

export default ExpenseItem;
