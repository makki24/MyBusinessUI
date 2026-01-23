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
      <Card.Content style={styles.cardContent}>
        {/* Header Row: Amount + Delete Button */}
        <View style={styles.headerRow}>
          <View style={[styles.infoItem, { flex: 1 }]}>
            <MaterialCommunityIcons
              name="cash"
              size={20}
              color={theme.colors.primary}
              style={styles.infoIcon}
            />
            <Text variant="titleLarge" style={styles.amount}>
              {sale.amount}
            </Text>
          </View>

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
          <View style={styles.userRow}>
            <UserDetails user={sale.user} compact />
          </View>
        )}

        {/* Date and Quantity Row */}
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
              {sale.date.toDateString()}
            </Text>
          </View>
          {sale.quantity && (
            <View style={styles.infoItem}>
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
          <View style={styles.descriptionRow}>
            <MaterialCommunityIcons
              name="text"
              size={14}
              color={theme.colors.onSurfaceVariant}
              style={styles.infoIcon}
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
          <View style={styles.tagsRow}>
            <Labels label={"Tags"} items={sale.tags} />
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
  amount: {
    fontWeight: "700",
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
  priceRow: {
    marginTop: 8,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  tagsRow: {
    marginTop: 8,
  },
});

export default SaleItem;
