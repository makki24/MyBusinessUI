import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Surface, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import reportService from "../../../services/ReportService";
import { Filter } from "../../../types";

interface ComparisonMetric {
  label: string;
  currentValue: number;
  previousValue: number;
  icon: string;
  gradientColors: readonly [string, string];
}

const MonthlyComparisonCard: React.FC = () => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<ComparisonMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createFilter = (monthsAgo: number): Filter => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {
      tags: [],
      excludeTags: [],
      fromDate: startOfMonth,
      toDate: endOfMonth,
    } as Filter;
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch current and previous month data
      const [currentWork, currentExpense, prevWork, prevExpense] =
        await Promise.all([
          reportService.getWorkSummaryByType(createFilter(0)),
          reportService.getExpenseSummaryByType(createFilter(0)),
          reportService.getWorkSummaryByType(createFilter(1)),
          reportService.getExpenseSummaryByType(createFilter(1)),
        ]);

      const sumTotal = (data: any[]) =>
        data?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0;

      const currentWorkTotal = sumTotal(currentWork);
      const currentExpenseTotal = sumTotal(currentExpense);
      const prevWorkTotal = sumTotal(prevWork);
      const prevExpenseTotal = sumTotal(prevExpense);

      setMetrics([
        {
          label: "Work Income",
          currentValue: currentWorkTotal,
          previousValue: prevWorkTotal,
          icon: "briefcase-outline",
          gradientColors: ["#10B981", "#059669"] as const,
        },
        {
          label: "Expenses",
          currentValue: currentExpenseTotal,
          previousValue: prevExpenseTotal,
          icon: "cash-minus",
          gradientColors: ["#EF4444", "#DC2626"] as const,
        },
        {
          label: "Net Balance",
          currentValue: currentWorkTotal - currentExpenseTotal,
          previousValue: prevWorkTotal - prevExpenseTotal,
          icon: "scale-balance",
          gradientColors: ["#6366F1", "#4F46E5"] as const,
        },
      ]);
    } catch (e) {
      setError(e.message || "Failed to load comparison data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatValue = (value: number): string => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  const getPercentChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  if (isLoading) {
    return (
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Monthly Comparison
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
          Monthly Comparison
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
          Monthly Comparison
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          vs Last Month
        </Text>
      </View>

      <View style={styles.metricsRow}>
        {metrics.map((metric, index) => {
          const percentChange = getPercentChange(
            metric.currentValue,
            metric.previousValue,
          );
          const isPositive = percentChange >= 0;
          const isNetBalance = metric.label === "Net Balance";
          const trendColor = isNetBalance
            ? isPositive
              ? "#10B981"
              : "#EF4444"
            : metric.label === "Expenses"
              ? isPositive
                ? "#EF4444"
                : "#10B981"
              : isPositive
                ? "#10B981"
                : "#EF4444";

          return (
            <View key={metric.label} style={styles.metricCard}>
              <LinearGradient
                colors={metric.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <MaterialCommunityIcons
                  name={metric.icon as any}
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>

              <Text
                style={[
                  styles.metricLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
                numberOfLines={1}
              >
                {metric.label}
              </Text>

              <Text
                style={[styles.metricValue, { color: theme.colors.onSurface }]}
              >
                {formatValue(metric.currentValue)}
              </Text>

              <View style={styles.trendContainer}>
                <MaterialCommunityIcons
                  name={isPositive ? "trending-up" : "trending-down"}
                  size={14}
                  color={trendColor}
                />
                <Text style={[styles.trendText, { color: trendColor }]}>
                  {Math.abs(percentChange).toFixed(0)}%
                </Text>
              </View>
            </View>
          );
        })}
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
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: UI_ELEMENTS_GAP,
  },
  metricCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: UI_ELEMENTS_GAP,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    marginBottom: 4,
    textAlign: "center",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default MonthlyComparisonCard;
