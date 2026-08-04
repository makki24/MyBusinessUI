import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RecentActivity } from "../../../services/DashboardService";

interface RecentActivityFeedProps {
  activities: RecentActivity[];
  loading: boolean;
  onItemPress: (item: RecentActivity) => void;
  onViewAll: () => void;
}

const TYPE_CONFIG: Record<
  string,
  {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    borderColor: string;
  }
> = {
  WORK: { icon: "briefcase-variant", color: "#2196F3", borderColor: "#2196F3" },
  EXPENSE: { icon: "wallet", color: "#FF9800", borderColor: "#FF9800" },
  CONTRIBUTION: {
    icon: "bank-transfer-in",
    color: "#4CAF50",
    borderColor: "#4CAF50",
  },
};

const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const formatAmount = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

export const RecentActivityItem: React.FC<{
  item: RecentActivity;
  onPress: () => void;
}> = ({ item, onPress }) => {
  const theme = useTheme();
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.WORK;

  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        {
          backgroundColor: theme.colors.surface,
          borderLeftColor: config.borderColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}
      >
        <MaterialCommunityIcons
          name={config.icon}
          size={20}
          color={config.color}
        />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeaderRow}>
          <Text
            variant="bodyMedium"
            style={{ fontWeight: "600", flex: 1 }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ fontWeight: "700", color: theme.colors.primary }}
          >
            {formatAmount(item.amount)}
          </Text>
        </View>
        <View style={styles.itemSubRow}>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}
            numberOfLines={1}
          >
            {item.subtitle}
            {item.metadata?.quantity
              ? ` • ${item.metadata.quantity} ${item.metadata.unit}`
              : ""}
            {item.metadata?.purpose ? ` • ${item.metadata.purpose}` : ""}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            {formatRelativeTime(item.date)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  loading,
  onItemPress,
  onViewAll,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text
          variant="titleSmall"
          style={[
            styles.sectionTitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Recent Activity
        </Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.primary, fontWeight: "600" }}
          >
            View All →
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            Loading...
          </Text>
        </View>
      ) : activities.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            No recent activity
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {activities.map((item) => (
            <RecentActivityItem
              key={`${item.type}-${item.id}`}
              item={item}
              onPress={() => onItemPress(item)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 12,
    gap: 6,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  itemSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default RecentActivityFeed;
