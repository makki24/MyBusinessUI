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

  const title = expense.type.isReceivingUser
    ? `${expense.type.name} → ${expense.receiver?.name}`
    : expense.type.name;

  return (
    <Card
      style={[commonItemStyles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Card.Content style={commonItemStyles.cardContent}>
        {/* Header Row: Expense Type + Delete Button */}
        <View style={commonItemStyles.headerRow}>
          <Text
            variant="titleMedium"
            style={[styles.title, { flex: 1 }]}
            numberOfLines={2}
          >
            {title}
          </Text>

          {canDelete && (
            <TouchableOpacity
              style={[
                commonItemStyles.deleteButton,
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

        {/* Sender */}
        {expense.sender && (
          <View style={commonItemStyles.userRow}>
            <UserDetails user={expense.sender} compact />
          </View>
        )}

        {/* Date and Time Row */}
        <View style={commonItemStyles.infoRow}>
          <View style={commonItemStyles.infoItem}>
            <MaterialCommunityIcons
              name="calendar"
              size={14}
              color={theme.colors.onSurfaceVariant}
              style={commonItemStyles.infoIcon}
            />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {expense.date.toDateString()}
            </Text>
          </View>
          <View style={commonItemStyles.infoItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={theme.colors.onSurfaceVariant}
              style={commonItemStyles.infoIcon}
            />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {expense.date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {/* Amount Row */}
        <View style={commonItemStyles.amountRow}>
          <View style={commonItemStyles.infoItem}>
            <MaterialCommunityIcons
              name="cash"
              size={16}
              color={theme.colors.primary}
              style={commonItemStyles.infoIcon}
            />
            <Text variant="bodyLarge" style={commonItemStyles.amount}>
              {expense.amount}
            </Text>
          </View>
          {/* Receiver if applicable */}
          {expense.type.isReceivingUser && expense.receiver && (
            <UserDetails user={expense.receiver} compact />
          )}
        </View>

        {/* Description */}
        {expense.description && (
          <View style={commonItemStyles.descriptionRow}>
            <MaterialCommunityIcons
              name="text"
              size={14}
              color={theme.colors.onSurfaceVariant}
              style={commonItemStyles.infoIcon}
            />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}
              numberOfLines={2}
            >
              {expense.description}
            </Text>
          </View>
        )}

        {/* Tags */}
        {expense.tags.length > 0 && (
          <View style={commonItemStyles.tagsRow}>
            <Labels label={"Tags"} items={expense.tags} />
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: "600",
    marginRight: 8,
  },
});

export default ExpenseItem;
