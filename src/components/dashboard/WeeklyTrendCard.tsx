import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Surface, ActivityIndicator } from "react-native-paper";
import { LineChart } from "react-native-gifted-charts";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import reportService from "../../../services/ReportService";
import { Filter } from "../../../types";

interface TrendData {
  label: string;
  workValue: number;
  expenseValue: number;
  netValue: number;
}

const WeeklyTrendCard: React.FC = () => {
  const theme = useTheme();
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState({ work: 0, expense: 0, net: 0 });
  const [weeklyChange, setWeeklyChange] = useState({
    work: 0,
    expense: 0,
    net: 0,
  });

  const getDayLabel = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const createFilter = (daysAgo: number): Filter => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return {
      tags: [],
      excludeTags: [],
      fromDate: date,
      toDate: endDate,
    } as Filter;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch last 7 days of data
      const promises = [];
      for (let i = 6; i >= 0; i--) {
        promises.push(
          Promise.all([
            reportService.getWorkSummaryByType(createFilter(i)),
            reportService.getExpenseSummaryByType(createFilter(i)),
          ]),
        );
      }

      const results = await Promise.all(promises);

      const sumTotal = (data: { totalAmount?: number }[]) =>
        data?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0;

      const data: TrendData[] = results.map((result, index) => {
        const [workData, expenseData] = result;
        const workValue = sumTotal(workData);
        const expenseValue = sumTotal(expenseData);
        return {
          label: getDayLabel(6 - index),
          workValue,
          expenseValue,
          netValue: workValue - expenseValue,
        };
      });

      setTrendData(data);

      // Calculate totals
      const totalWork = data.reduce((sum, d) => sum + d.workValue, 0);
      const totalExpense = data.reduce((sum, d) => sum + d.expenseValue, 0);
      setTotals({
        work: totalWork,
        expense: totalExpense,
        net: totalWork - totalExpense,
      });

      // Calculate week-over-week change (compare first half to second half)
      const firstHalf = data
        .slice(0, 3)
        .reduce((sum, d) => sum + d.netValue, 0);
      const secondHalf = data.slice(4).reduce((sum, d) => sum + d.netValue, 0);
      const change =
        firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
      setWeeklyChange({ work: 0, expense: 0, net: change });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch weekly trend:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatValue = (value: number): string => {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toFixed(0);
  };

  if (isLoading) {
    return (
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
        elevation={2}
      >
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Weekly Trend
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </Surface>
    );
  }

  const workData = trendData.map((d) => ({
    value: d.workValue / 1000,
    label: d.label,
  }));
  const expenseData = trendData.map((d) => ({
    value: d.expenseValue / 1000,
    label: "",
  }));

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      elevation={2}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            📊 Weekly Performance
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Last 7 days breakdown
          </Text>
        </View>
        <View
          style={[
            styles.changeBadge,
            {
              backgroundColor:
                weeklyChange.net >= 0 ? "#10B98120" : "#EF444420",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={weeklyChange.net >= 0 ? "trending-up" : "trending-down"}
            size={14}
            color={weeklyChange.net >= 0 ? "#10B981" : "#EF4444"}
          />
          <Text
            style={{
              color: weeklyChange.net >= 0 ? "#10B981" : "#EF4444",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {Math.abs(weeklyChange.net).toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: "#10B981" }]} />
          <Text
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Income
          </Text>
          <Text style={[styles.statValue, { color: "#10B981" }]}>
            {formatValue(totals.work)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: "#EF4444" }]} />
          <Text
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Expense
          </Text>
          <Text style={[styles.statValue, { color: "#EF4444" }]}>
            {formatValue(totals.expense)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: "#6366F1" }]} />
          <Text
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Net
          </Text>
          <Text
            style={[
              styles.statValue,
              { color: totals.net >= 0 ? "#6366F1" : "#EF4444" },
            ]}
          >
            {formatValue(totals.net)}
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={workData}
          data2={expenseData}
          color1="#10B981"
          color2="#EF4444"
          height={120}
          width={280}
          spacing={40}
          initialSpacing={10}
          hideYAxisText
          hideRules
          curved
          thickness={3}
          dataPointsColor1="#10B981"
          dataPointsColor2="#EF4444"
          dataPointsRadius={4}
          areaChart
          startFillColor1="#10B98130"
          endFillColor1="transparent"
          startFillColor2="#EF444430"
          endFillColor2="transparent"
          xAxisLabelTextStyle={{
            color: theme.colors.onSurfaceVariant,
            fontSize: 10,
          }}
          xAxisThickness={0}
          yAxisThickness={0}
        />
      </View>

      {/* Insights */}
      <View
        style={[
          styles.insightBox,
          { backgroundColor: theme.colors.primaryContainer + "30" },
        ]}
      >
        <MaterialCommunityIcons
          name="lightbulb-outline"
          size={16}
          color={theme.colors.primary}
        />
        <Text style={[styles.insightText, { color: theme.colors.onSurface }]}>
          {totals.net >= 0
            ? `Great! You earned ${formatValue(totals.net)} more than you spent this week.`
            : `Heads up! Expenses exceeded income by ${formatValue(Math.abs(totals.net))} this week.`}
        </Text>
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
    alignItems: "flex-start",
    marginBottom: UI_ELEMENTS_GAP,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: UI_ELEMENTS_GAP,
    paddingVertical: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: UI_ELEMENTS_GAP / 2,
  },
  insightBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: UI_ELEMENTS_GAP / 2,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default WeeklyTrendCard;
