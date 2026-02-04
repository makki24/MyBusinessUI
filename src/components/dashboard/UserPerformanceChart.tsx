import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme, Surface, ActivityIndicator } from "react-native-paper";
import { BarChart } from "react-native-gifted-charts";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import { useRecoilValue } from "recoil";
import { usersState } from "../../../recoil/atom";
import reportService from "../../../services/ReportService";
import { Filter } from "../../../types";

interface UserPerformance {
  userId: string;
  userName: string;
  totalAmount: number;
  color: string;
}

const BAR_COLORS = [
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#F97316", // Orange
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#EF4444", // Red
];

interface UserPerformanceChartProps {
  onUserSelect?: (userId: string) => void;
  type?: "work" | "expense";
}

const UserPerformanceChart: React.FC<UserPerformanceChartProps> = ({
  onUserSelect,
  type = "work",
}) => {
  const theme = useTheme();
  const users = useRecoilValue(usersState);
  const [performanceData, setPerformanceData] = useState<UserPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxValue, setMaxValue] = useState(0);

  const createFilter = (): Filter => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    return {
      tags: [],
      excludeTags: [],
      fromDate: thisMonth,
      toDate: new Date(),
    } as Filter;
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const api =
        type === "work"
          ? reportService.getWorkSummaryByType
          : reportService.getExpenseSummaryByType;

      const result = await api(createFilter());

      if (result && result.length > 0) {
        // Aggregate by user from subTransactions if available
        const userMap = new Map<string, number>();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.forEach((item: any) => {
          if (item.subTransactions) {
            item.subTransactions.forEach(
              (sub: {
                receiver?: { id: string; name: string };
                totalAmount?: number;
              }) => {
                if (sub.receiver) {
                  const userId = sub.receiver.id || sub.receiver.name;
                  const current = userMap.get(userId) || 0;
                  userMap.set(userId, current + (sub.totalAmount || 0));
                }
              },
            );
          }
        });

        // Convert to array and sort
        const sortedData = Array.from(userMap.entries())
          .map(([userId, amount], index) => {
            const user = users?.find((u) => u.id === userId);
            return {
              userId,
              userName: user?.name || `User ${userId}`,
              totalAmount: amount,
              color: BAR_COLORS[index % BAR_COLORS.length],
            };
          })
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 8); // Top 8 users

        setPerformanceData(sortedData);
        setMaxValue(Math.max(...sortedData.map((d) => d.totalAmount), 1));
      }
    } catch (e) {
      setError(e.message || "Failed to load performance data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const title = type === "work" ? "Top Earners" : "Top Spenders";

  if (isLoading) {
    return (
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {title}
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
          {title}
        </Text>
        <Text style={{ color: theme.colors.error, textAlign: "center" }}>
          {error}
        </Text>
      </Surface>
    );
  }

  if (performanceData.length === 0) {
    return (
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        <Text
          style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}
        >
          No data available
        </Text>
      </Surface>
    );
  }

  const barData = performanceData.map((item) => ({
    value: item.totalAmount,
    label: item.userName.split(" ")[0], // First name only
    frontColor: item.color,
    gradientColor: `${item.color}80`,
    topLabelComponent: () => (
      <Text style={[styles.barLabel, { color: theme.colors.onSurface }]}>
        {(item.totalAmount / 1000).toFixed(0)}k
      </Text>
    ),
    onPress: () => onUserSelect?.(item.userId),
  }));

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      elevation={2}
    >
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          This Month
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <BarChart
          data={barData}
          barWidth={32}
          spacing={20}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{
            color: theme.colors.onSurfaceVariant,
            fontSize: 10,
          }}
          xAxisLabelTextStyle={{
            color: theme.colors.onSurface,
            fontSize: 10,
            width: 50,
            textAlign: "center",
          }}
          noOfSections={4}
          maxValue={maxValue * 1.1}
          isAnimated
          animationDuration={800}
          barBorderRadius={6}
          showGradient
          height={180}
          initialSpacing={10}
        />
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {performanceData.slice(0, 4).map((item) => (
          <TouchableOpacity
            key={item.userId}
            style={styles.legendItem}
            onPress={() => onUserSelect?.(item.userId)}
          >
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text
              style={[styles.legendText, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {item.userName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: UI_ELEMENTS_GAP,
    marginVertical: UI_ELEMENTS_GAP / 2,
    padding: UI_ELEMENTS_GAP,
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
  subtitle: {
    fontSize: 12,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainer: {
    alignItems: "center",
    paddingVertical: UI_ELEMENTS_GAP / 2,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: UI_ELEMENTS_GAP,
    gap: UI_ELEMENTS_GAP,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    maxWidth: 70,
  },
});

export default UserPerformanceChart;
