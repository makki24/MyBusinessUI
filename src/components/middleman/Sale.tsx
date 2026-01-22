import { View, StyleSheet } from "react-native";
import { Text, Avatar, useTheme } from "react-native-paper";
import React, { useState, useEffect, useMemo } from "react";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import { Sale as SaleType } from "../../../types";
import { CURRENCY_SYMBOL } from "../../constants/labels";

interface SaleProps {
  sale: SaleType;
}

const Sale: React.FC<SaleProps> = ({ sale }) => {
  const theme = useTheme();
  const [imageExists, setImageExists] = useState(true);

  // Parse amount as number to remove any currency symbols from backend
  const numericAmount = useMemo(() => {
    return typeof sale.amount === "number"
      ? sale.amount
      : parseFloat(String(sale.amount).replace(/[^0-9.-]/g, "")) || 0;
  }, [sale.amount]);

  // Get user initials for fallback avatar
  const userInitials = useMemo(() => {
    const name = sale.user?.name || "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [sale.user?.name]);

  useEffect(() => {
    const checkImageExists = async () => {
      try {
        if (!sale.user?.picture || sale.user.picture === "")
          throw new Error("No image");
        const response = await fetch(sale.user.picture);
        setImageExists(response.ok);
      } catch {
        setImageExists(false);
      }
    };
    checkImageExists();
  }, [sale.user?.picture]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Row 1: Avatar + Username */}
      <View style={styles.topRow}>
        {imageExists && sale.user?.picture ? (
          <Avatar.Image
            size={40}
            source={{ uri: sale.user.picture }}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Text
            size={40}
            label={userInitials}
            style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
            labelStyle={{ color: theme.colors.onPrimaryContainer, fontWeight: "600" }}
          />
        )}
        <Text
          variant="titleMedium"
          style={[styles.userName, { color: theme.colors.onSurface }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {sale.user?.name || "Unknown User"}
        </Text>
      </View>

      {/* Row 2: Amount Badge */}
      <View style={[styles.amountBadge, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text style={[styles.amount, { color: theme.colors.onPrimaryContainer }]}>
          {CURRENCY_SYMBOL}{numericAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: UI_ELEMENTS_GAP / 2,
    minHeight: 56,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    marginRight: 10,
  },
  userName: {
    fontWeight: "600",
    fontSize: 15,
    flex: 1,
  },
  amountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 8,
  },
  amount: {
    fontSize: 13,
    fontWeight: "700",
  },
});

export default Sale;

