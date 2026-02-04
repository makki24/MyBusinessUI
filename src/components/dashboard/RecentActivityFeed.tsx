import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  Text,
  useTheme,
  Surface,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import reportService from "../../../services/ReportService";
import { Filter } from "../../../types";

interface ActivityItem {
  id: string;
  type: "work" | "expense" | "sale" | "contribution";
  userName: string;
  amount: number;
  date: Date;
  description: string;
}

const TYPE_CONFIG = {
  work: {
    icon: "hammer-wrench",
    color: "#10B981",
    bgColor: "#10B98120",
    label: "Work",
  },
  expense: {
    icon: "cash-minus",
    color: "#EF4444",
    bgColor: "#EF444420",
    label: "Expense",
  },
  sale: {
    icon: "cart-outline",
    color: "#6366F1",
    bgColor: "#6366F120",
    label: "Sale",
  },
  contribution: {
    icon: "gift-outline",
    color: "#F59E0B",
    bgColor: "#F59E0B20",
    label: "Contribution",
  },
};

const RecentActivityFeed: React.FC = () => {
  const theme = useTheme();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createFilter = (): Filter => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return {
      tags: [],
      excludeTags: [],
      fromDate: lastWeek,
      toDate: new Date(),
    } as Filter;
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [workData, expenseData] = await Promise.all([
        reportService.getWorkSummaryByType(createFilter()),
        reportService.getExpenseSummaryByType(createFilter()),
      ]);

      // Create mock activity from the summary data
      const workActivities: ActivityItem[] = (workData || []).slice(0, 5).map(
        (
          item: {
            receiver?: { name: string };
            baseTransactionType?: { name: string };
            totalAmount?: number;
          },
          index: number,
        ) => ({
          id: `work-${index}`,
          type: "work" as const,
          userName:
            item.receiver?.name || item.baseTransactionType?.name || "Unknown",
          amount: item.totalAmount || 0,
          date: new Date(),
          description: item.baseTransactionType?.name || "Work",
        }),
      );

      const expenseActivities: ActivityItem[] = (expenseData || [])
        .slice(0, 5)
        .map(
          (
            item: {
              receiver?: { name: string };
              baseTransactionType?: { name: string };
              totalAmount?: number;
            },
            index: number,
          ) => ({
            id: `expense-${index}`,
            type: "expense" as const,
            userName:
              item.receiver?.name ||
              item.baseTransactionType?.name ||
              "Unknown",
            amount: item.totalAmount || 0,
            date: new Date(),
            description: item.baseTransactionType?.name || "Expense",
          }),
        );

      // Combine and sort by amount (simulating recency)
      const combined = [...workActivities, ...expenseActivities]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      setActivities(combined);
    } catch (e) {
      setError(e.message || "Failed to load activity");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toFixed(0);
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  if (isLoading) {
    return (
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Recent Activity
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </Surface>
    );
  }

  if (error) {
    return (
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Recent Activity
        </Text>
        <Text style={{ color: theme.colors.error }}>{error}</Text>
      </Surface>
    );
  }

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      elevation={2}
    >
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Recent Activity
        </Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: theme.colors.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {activities.map((activity, index) => {
          const config = TYPE_CONFIG[activity.type];
          const isLast = index === activities.length - 1;

          return (
            <View key={activity.id}>
              <TouchableOpacity style={styles.activityItem} activeOpacity={0.7}>
                {/* Avatar */}
                <View
                  style={[
                    styles.avatarContainer,
                    { backgroundColor: config.bgColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    name={config.icon as any}
                    size={20}
                    color={config.color}
                  />
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                  <Text
                    style={[styles.userName, { color: theme.colors.onSurface }]}
                    numberOfLines={1}
                  >
                    {activity.userName}
                  </Text>
                  <View style={styles.detailsRow}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: config.bgColor },
                      ]}
                    >
                      <Text style={[styles.typeText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.dateText,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {formatDate(activity.date)}
                    </Text>
                  </View>
                </View>

                {/* Amount */}
                <Text
                  style={[
                    styles.amount,
                    {
                      color:
                        activity.type === "expense" ? "#EF4444" : "#10B981",
                    },
                  ]}
                >
                  {activity.type === "expense" ? "-" : "+"}
                  {formatAmount(activity.amount)}
                </Text>
              </TouchableOpacity>

              {!isLast && (
                <Divider
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.outlineVariant },
                  ]}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: UI_ELEMENTS_GAP,
    marginVertical: UI_ELEMENTS_GAP / 2,
    padding: UI_ELEMENTS_GAP,
    maxHeight: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: UI_ELEMENTS_GAP,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  viewAll: {
    fontSize: 13,
    fontWeight: "500",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    maxHeight: 320,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 11,
  },
  amount: {
    fontSize: 15,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginLeft: 56,
  },
});

export default RecentActivityFeed;
