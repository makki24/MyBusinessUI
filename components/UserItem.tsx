// src/components/UserItem.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { User } from "../types";
import UserDetails from "./common/UserDetails";
import { useRecoilValue } from "recoil";
import { canDelete as canDeleteSelector } from "../recoil/selectors";
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
  const userCanDelete = useRecoilValue(canDeleteSelector);
  const theme = useTheme();

  return (
    <Card
      mode="elevated"
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Card.Content style={styles.cardContent}>
        {/* Top Row: User Details (Left) + Balance (Right) */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onEdit} style={{ flex: 1 }}>
            <UserDetails user={user} />
          </TouchableOpacity>

          <View style={styles.balanceHeader}>
            <UserRemainingAmount user={user} />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottom Row: Contact Info (Left) + Delete (Right) */}
        <View style={styles.bottomRow}>
          <View style={styles.contactContainer}>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons
                name="email-outline"
                size={16}
                color={theme.colors.onSurfaceVariant}
                style={styles.contactIcon}
              />
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
                numberOfLines={1}
              >
                {user.email || "No email provided"}
              </Text>
            </View>

            <View style={styles.contactRow}>
              <MaterialCommunityIcons
                name="phone-outline"
                size={16}
                color={theme.colors.onSurfaceVariant}
                style={styles.contactIcon}
              />
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {user.phoneNumber || "No phone provided"}
              </Text>
            </View>
          </View>

          {userCanDelete && (
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
                name="delete-outline"
                size={20}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceHeader: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  contactContainer: {
    flex: 1,
    gap: 4,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactIcon: {
    marginRight: 8,
    width: 20,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
});

export default UserItem;
