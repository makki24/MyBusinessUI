import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  useTheme,
  Surface,
  ActivityIndicator,
  Chip,
} from "react-native-paper";
import { LineChart } from "react-native-gifted-charts";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import reportService from "../../../services/ReportService";
import { Filter } from "../../../types";

interface BalancePoint {
  value: number;
  label: string;
  date: Date;
}

const BalanceOverviewCard: React.FC = () => {
  const theme = useTheme();
  const [balanceData, setBalanceData] = useState<BalancePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [highestBalance, setHighestBalance] = useState(0);
  const [lowestBalance, setLowestBalance] = useState(0);
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");

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
      let runningBalance = 0;
      const balances: BalancePoint[] = [];

      // Fetch last 14 days
      for (let i = 13; i >= 0; i--) {
        const [workData, expenseData] = await Promise.all([
          reportService.getWorkSummaryByType(createFilter(i)),
          reportService.getExpenseSummaryByType(createFilter(i)),
        ]);

        const sumTotal = (data: { totalAmount?: number }[]) =>
          data?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0;

        const dayIncome = sumTotal(workData);
        const dayExpense = sumTotal(expenseData);
        runningBalance += dayIncome - dayExpense;

        const date = new Date();
        date.setDate(date.getDate() - i);

        balances.push({
          value: runningBalance,
          label:
            i % 2 === 0
              ? date.toLocaleDateString("en-US", { day: "2-digit" })
              : "",
          date,
        });
      }

      setBalanceData(balances);
      setCurrentBalance(runningBalance);

      const maxBal = Math.max(...balances.map((b) => b.value));
      const minBal = Math.min(...balances.map((b) => b.value));
      setHighestBalance(maxBal);
      setLowestBalance(minBal);

      // Determine trend from last 3 days
      if (balances.length >= 3) {
        const recent = balances.slice(-3);
        const avgChange = (recent[2].value - recent[0].value) / 2;
        setTrend(
          avgChange > 1000 ? "up" : avgChange < -1000 ? "down" : "stable",
        );
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch balance:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatValue = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (absValue >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toFixed(0);
  };

  if (isLoading) {
    return (
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
        elevation={2}
      >
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          💹 Balance Overview
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </Surface>
    );
  }

  const chartData = balanceData.map((b) => ({
    value: Math.max(0, b.value / 1000),
    label: b.label,
    dataPointText: b.label ? `${formatValue(b.value)}` : undefined,
  }));

  const trendConfig = {
    up: { color: "#10B981", icon: "trending-up", text: "Growing" },
    down: { color: "#EF4444", icon: "trending-down", text: "Declining" },
    stable: { color: "#6366F1", icon: "trending-neutral", text: "Stable" },
  };

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      elevation={2}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            💹 Balance Overview
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Last 14 days running balance
          </Text>
        </View>
        <Chip
          mode="flat"
          icon={() => (
            <MaterialCommunityIcons
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              name={trendConfig[trend].icon as any}
              size={14}
              color={trendConfig[trend].color}
            />
          )}
          style={{ backgroundColor: `${trendConfig[trend].color}15` }}
          textStyle={{ color: trendConfig[trend].color, fontSize: 11 }}
        >
          {trendConfig[trend].text}
        </Chip>
      </View>

      {/* Current Balance Hero */}
      <LinearGradient
        colors={
          currentBalance >= 0
            ? (["#10B981", "#059669"] as const)
            : (["#EF4444", "#DC2626"] as const)
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceHero}
      >
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>{formatValue(currentBalance)}</Text>
        <Text style={styles.balanceDate}>as of today</Text>
      </LinearGradient>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          color={currentBalance >= 0 ? "#10B981" : "#EF4444"}
          height={100}
          width={280}
          spacing={20}
          initialSpacing={5}
          hideYAxisText
          hideRules
          curved
          thickness={2}
          dataPointsColor={currentBalance >= 0 ? "#10B981" : "#EF4444"}
          dataPointsRadius={3}
          areaChart
          startFillColor={currentBalance >= 0 ? "#10B98130" : "#EF444430"}
          endFillColor="transparent"
          xAxisLabelTextStyle={{
            color: theme.colors.onSurfaceVariant,
            fontSize: 9,
          }}
          xAxisThickness={0}
          yAxisThickness={0}
          showDataPointLabelOnFocus
          focusedDataPointLabelComponent={(item: {
            dataPointText?: string;
          }) => (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>{item.dataPointText}</Text>
            </View>
          )}
        />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <MaterialCommunityIcons
            name="arrow-up-circle"
            size={20}
            color="#10B981"
          />
          <Text
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Highest
          </Text>
          <Text style={[styles.statValue, { color: "#10B981" }]}>
            {formatValue(highestBalance)}
          </Text>
        </View>
        <View
          style={[
            styles.statDivider,
            { backgroundColor: theme.colors.outlineVariant },
          ]}
        />
        <View style={styles.statBox}>
          <MaterialCommunityIcons
            name="arrow-down-circle"
            size={20}
            color="#EF4444"
          />
          <Text
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Lowest
          </Text>
          <Text style={[styles.statValue, { color: "#EF4444" }]}>
            {formatValue(lowestBalance)}
          </Text>
        </View>
        <View
          style={[
            styles.statDivider,
            { backgroundColor: theme.colors.outlineVariant },
          ]}
        />
        <View style={styles.statBox}>
          <MaterialCommunityIcons
            name="swap-vertical"
            size={20}
            color="#6366F1"
          />
          <Text
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Variance
          </Text>
          <Text style={[styles.statValue, { color: "#6366F1" }]}>
            {formatValue(highestBalance - lowestBalance)}
          </Text>
        </View>
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
  loadingContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceHero: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: UI_ELEMENTS_GAP,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 4,
  },
  balanceValue: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "bold",
  },
  balanceDate: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 4,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: UI_ELEMENTS_GAP / 2,
  },
  tooltip: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: UI_ELEMENTS_GAP,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB20",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 2,
  },
});

export default BalanceOverviewCard;
