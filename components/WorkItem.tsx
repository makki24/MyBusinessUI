// src/components/WorkItem.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { Work } from "../types";
import UserDetails from "./common/UserDetails";
import commonItemStyles from "../src/styles/commonItemStyles";
import Labels from "./common/Labels";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface WorkItemProps {
  work: Work;
  onPress: () => void;
  onDelete: () => void;
  canDelete?: boolean;
}

const WorkItem: React.FC<WorkItemProps> = ({
  work,
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
      <Card.Content style={commonItemStyles.cardContent}>
        {/* Header Row: Work Type + Delete Button */}
        <View style={commonItemStyles.headerRow}>
          <Text
            variant="titleMedium"
            style={[styles.title, { flex: 1 }]}
            numberOfLines={2}
          >
            {work.type.name}
          </Text>

          {/* Delete Button - Top Right */}
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
              accessibilityLabel="Delete work"
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

        {/* User Details */}
        {work.user && (
          <View style={commonItemStyles.userRow}>
            <UserDetails user={work.user} compact />
          </View>
        )}

        {/* Date and Quantity Row */}
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
              {work.date.toDateString()}
            </Text>
          </View>
          <View style={commonItemStyles.infoItem}>
            <Text variant="bodySmall" style={{ fontWeight: "600" }}>
              Qty: {work.quantity}
            </Text>
          </View>
        </View>

        {/* Price and Amount Row */}
        <View style={commonItemStyles.amountRow}>
          <View style={commonItemStyles.infoItem}>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              @ {work.pricePerUnit}/unit
            </Text>
          </View>
          <View style={commonItemStyles.infoItem}>
            <MaterialCommunityIcons
              name="cash"
              size={16}
              color={theme.colors.primary}
              style={commonItemStyles.infoIcon}
            />
            <Text variant="bodyLarge" style={commonItemStyles.amount}>
              {work.amount}
            </Text>
          </View>
        </View>

        {/* Description */}
        {work.description && (
          <View style={commonItemStyles.descriptionRow}>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
              numberOfLines={2}
            >
              {work.description}
            </Text>
          </View>
        )}

        {/* Tags */}
        {work.tags.length > 0 && (
          <View style={commonItemStyles.tagsRow}>
            <Labels label={"Tags"} items={work.tags} />
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

export default WorkItem;
