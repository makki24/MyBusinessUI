// src/components/SaleItem.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { Sale } from "../types";
import UserDetails from "./common/UserDetails";
import commonItemStyles from "../src/styles/commonItemStyles";
import Labels from "./common/Labels";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SaleItemProps {
  sale: Sale;
  onPress: () => void;
  onDelete: () => void;
  canDelete?: boolean;
}

const SaleItem: React.FC<SaleItemProps> = ({
  sale,
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
        {/* Header Row: Amount + Delete Button */}
        <View style={commonItemStyles.headerRow}>
          <View style={[commonItemStyles.infoItem, { flex: 1 }]}>
            <MaterialCommunityIcons
              name="cash"
              size={20}
              color={theme.colors.primary}
              style={commonItemStyles.infoIcon}
            />
            <Text variant="titleLarge" style={styles.amount}>
              {sale.amount}
            </Text>
          </View>

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
              accessibilityLabel="Delete sale"
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
        {sale.user && (
          <View style={commonItemStyles.userRow}>
            <UserDetails user={sale.user} compact />
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
              {sale.date.toDateString()}
            </Text>
          </View>
          {sale.quantity && (
            <View style={commonItemStyles.infoItem}>
              <Text variant="bodySmall" style={{ fontWeight: "600" }}>
                Qty: {sale.quantity}
              </Text>
            </View>
          )}
        </View>

        {/* Price Per Unit */}
        {sale.pricePerUnit && (
          <View style={styles.priceRow}>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              @ {sale.pricePerUnit}/unit
            </Text>
          </View>
        )}

        {/* Description */}
        {sale.description && (
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
              {sale.description}
            </Text>
          </View>
        )}

        {/* Tags */}
        {sale.tags.length > 0 && (
          <View style={commonItemStyles.tagsRow}>
            <Labels label={"Tags"} items={sale.tags} />
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  amount: {
    fontWeight: "700",
  },
  priceRow: {
    marginTop: 8,
  },
});

export default SaleItem;
