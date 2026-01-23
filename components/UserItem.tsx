// src/components/UserItem.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { User } from "../types";
import UserDetails from "./common/UserDetails";
import commonItemStyles from "../src/styles/commonItemStyles";
import { useRecoilValue } from "recoil";
import { isAdmin } from "../recoil/selectors";
import UserRemainingAmount from "../src/components/common/UserRemainingAmount";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface UserItemProps {
  user: User;
  onPress: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  onPress,
  onDelete,
  onEdit,
}) => {
  const isUserAdmin = useRecoilValue(isAdmin);
  const theme = useTheme();

  return (
    <Card
      style={[commonItemStyles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Card.Content style={styles.cardContent}>
        {/* Header Row: UserDetails + Delete Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onEdit} style={{ flex: 1 }}>
            <UserDetails user={user} />
          </TouchableOpacity>

          {/* Delete Button - Top Right */}
          {isUserAdmin && (
            <TouchableOpacity
              style={[
                styles.deleteButton,
                { backgroundColor: theme.colors.errorContainer },
              ]}
              onPress={(e) => {
                e?.stopPropagation?.();
                onDelete();
              }}
              accessibilityLabel={`Delete user ${user.name}`}
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

        {/* Info Rows */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="email-outline"
              size={16}
              color={theme.colors.onSurfaceVariant}
              style={styles.infoIcon}
            />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}
              numberOfLines={1}
            >
              {user.email}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={16}
              color={theme.colors.onSurfaceVariant}
              style={styles.infoIcon}
            />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {user.phoneNumber}
            </Text>
          </View>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceContainer}>
          <Text variant="bodyMedium" style={styles.balanceLabel}>
            Balance
          </Text>
          <UserRemainingAmount user={user} />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
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
    marginLeft: 8,
  },
  infoSection: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 8,
    width: 20, // Alignment
  },
  balanceContainer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  balanceLabel: {
    fontWeight: "600",
    opacity: 0.7,
  },
});

export default UserItem;
