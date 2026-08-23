import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  useTheme,
  ActivityIndicator,
  Chip,
  Card,
  ProgressBar,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { DatePickerModal } from "react-native-paper-dates";
import reportService from "../services/ReportService";
import { Filter } from "../types";
import { UI_ELEMENTS_GAP, CONTAINER_PADDING } from "../src/styles/constants";

type DateRangePreset =
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "THIS_QUARTER"
  | "ALL_TIME"
  | "CUSTOM";

interface PieDataItem {
  value: number;
  color: string;
  label: string;
  count?: number;
}

interface SummaryItem {
  totalAmount: number;
  baseTransactionType?: {
    name?: string;
    isReceivingUser?: boolean;
  };
}

interface MonthlyTrendItem {
  month: string;
  outflow: number;
  contribution: number;
}

// Curated modern color palette for clean visual hierarchy
const CHART_COLORS = [
  "#4F46E5", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#3B82F6", // Blue
  "#64748B", // Slate
];

const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const formatShortCurrency = (amount: number): string => {
  if (amount <= 0) return "0";
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}k`;
  }
  return `₹${amount.toFixed(0)}`;
};

const getPresetDates = (
  preset: DateRangePreset,
): { fromDate: Date; toDate: Date } => {
  const now = new Date();
  const toDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );

  if (preset === "THIS_MONTH") {
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    return { fromDate, toDate };
  }

  if (preset === "LAST_MONTH") {
    const fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );
    return { fromDate, toDate: lastDayLastMonth };
  }

  if (preset === "THIS_QUARTER") {
    const currentQuarterMonth = Math.floor(now.getMonth() / 3) * 3;
    const fromDate = new Date(now.getFullYear(), currentQuarterMonth, 1);
    return { fromDate, toDate };
  }

  if (preset === "ALL_TIME") {
    return { fromDate: new Date(2020, 0, 1), toDate };
  }

  // Fallback for custom
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  return { fromDate: defaultFrom, toDate };
};

const createMonthFilter = (monthsAgo: number): Filter => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
  return {
    tags: [],
    excludeTags: [],
    fromDate: startOfMonth,
    toDate: endOfMonth,
  } as Filter;
};

// Shared helper to compute clean financial summary excluding internal transfers
const fetchMonthSummary = async (filter: Filter) => {
  const [expenseRes, workRes, aggregateRes] = await Promise.all([
    reportService.getExpenseSummaryByType(filter),
    reportService.getWorkSummaryByType(filter),
    reportService.getReport(filter),
  ]);

  const filteredExpenses = ((expenseRes as SummaryItem[]) || []).filter(
    (item: SummaryItem) => {
      const typeName = item.baseTransactionType?.name || "";
      const isTransfer = typeName.toLowerCase().includes("transfer");
      const isReceivingUser = item.baseTransactionType?.isReceivingUser;
      return !isTransfer && !isReceivingUser && item.totalAmount > 0;
    },
  );

  const totalExpense = filteredExpenses.reduce(
    (sum: number, item: SummaryItem) => sum + (item.totalAmount || 0),
    0,
  );

  const filteredWorks = ((workRes as SummaryItem[]) || []).filter(
    (item: SummaryItem) => item.totalAmount > 0,
  );

  const totalWork = filteredWorks.reduce(
    (sum: number, item: SummaryItem) => sum + (item.totalAmount || 0),
    0,
  );

  return {
    filteredExpenses,
    filteredWorks,
    totalExpense,
    totalWork,
    totalOutflow: totalExpense + totalWork,
    totalContribution: aggregateRes?.totalContributionAmount || 0,
  };
};

const MonthlyBreakdownScreen: React.FC = () => {
  const theme = useTheme();
  const [selectedPreset, setSelectedPreset] =
    useState<DateRangePreset>("THIS_MONTH");
  const [dateRange, setDateRange] = useState(getPresetDates("THIS_MONTH"));

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [expenseData, setExpenseData] = useState<PieDataItem[]>([]);
  const [workData, setWorkData] = useState<PieDataItem[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendItem[]>([]);

  const [totalExpense, setTotalExpense] = useState(0);
  const [totalWork, setTotalWork] = useState(0);
  const [totalContribution, setTotalContribution] = useState(0);

  const handlePresetSelect = (preset: DateRangePreset) => {
    if (preset === "CUSTOM") {
      setIsDatePickerOpen(true);
    } else {
      setSelectedPreset(preset);
      setDateRange(getPresetDates(preset));
    }
  };

  const onConfirmDateRange = useCallback(
    ({ startDate, endDate }: { startDate?: Date; endDate?: Date }) => {
      setIsDatePickerOpen(false);
      if (startDate) {
        const finalEndDate = endDate || startDate;
        const endWithTime = new Date(
          finalEndDate.getFullYear(),
          finalEndDate.getMonth(),
          finalEndDate.getDate(),
          23,
          59,
          59,
        );
        setSelectedPreset("CUSTOM");
        setDateRange({ fromDate: startDate, toDate: endWithTime });
      }
    },
    [],
  );

  const onDismissDatePicker = useCallback(() => {
    setIsDatePickerOpen(false);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const filter: Filter = {
        tags: [],
        excludeTags: [],
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
      } as Filter;

      // 1. Fetch current selected range summary
      const currentSummary = await fetchMonthSummary(filter);

      setTotalExpense(currentSummary.totalExpense);
      setTotalWork(currentSummary.totalWork);
      setTotalContribution(currentSummary.totalContribution);

      const expChartData: PieDataItem[] = currentSummary.filteredExpenses.map(
        (item: SummaryItem, index: number) => ({
          value: item.totalAmount,
          color: CHART_COLORS[index % CHART_COLORS.length],
          label: item.baseTransactionType?.name || "Other",
        }),
      );
      setExpenseData(expChartData);

      const wrkChartData: PieDataItem[] = currentSummary.filteredWorks.map(
        (item: SummaryItem, index: number) => ({
          value: item.totalAmount,
          color: CHART_COLORS[index % CHART_COLORS.length],
          label: item.baseTransactionType?.name || "Work",
        }),
      );
      setWorkData(wrkChartData);

      // 2. Fetch 6-month trends using identical filter logic
      const monthsAgoList = [5, 4, 3, 2, 1, 0];
      const trendResults = await Promise.all(
        monthsAgoList.map(async (monthsAgo) => {
          const d = new Date();
          d.setMonth(d.getMonth() - monthsAgo);
          const monthName = d.toLocaleDateString("en-IN", { month: "short" });

          let summary;
          if (monthsAgo === 0 && selectedPreset === "THIS_MONTH") {
            summary = currentSummary;
          } else {
            const mFilter = createMonthFilter(monthsAgo);
            summary = await fetchMonthSummary(mFilter);
          }

          return {
            month: monthName,
            outflow: summary.totalOutflow,
            contribution: summary.totalContribution,
          };
        }),
      );
      setMonthlyTrends(trendResults);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to load breakdown data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, selectedPreset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const dateRangeLabel = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return `${dateRange.fromDate.toLocaleDateString("en-IN", options)} - ${dateRange.toDate.toLocaleDateString("en-IN", options)}`;
  }, [dateRange]);

  const totalOutflow = totalWork + totalExpense;
  const netBalance = totalContribution - totalOutflow;
  const coveragePercent =
    totalOutflow > 0 ? (totalContribution / totalOutflow) * 100 : 0;

  const maxChartValue = useMemo(() => {
    if (monthlyTrends.length === 0) return 1000;
    const maxVal = Math.max(
      ...monthlyTrends.flatMap((t) => [t.outflow, t.contribution]),
    );
    return maxVal > 0 ? maxVal * 1.15 : 1000;
  }, [monthlyTrends]);

  const groupedBarData = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any[] = [];
    monthlyTrends.forEach((item, index) => {
      const isLast = index === monthlyTrends.length - 1;
      result.push({
        value: item.outflow,
        label: item.month,
        spacing: 3,
        labelWidth: 34,
        frontColor: "#EA580C",
        topLabelComponent: () => (
          <Text
            style={{
              fontSize: 7.5,
              color: theme.colors.onSurfaceVariant,
              fontWeight: "700",
              marginBottom: 2,
            }}
          >
            {item.outflow > 0 ? formatShortCurrency(item.outflow) : ""}
          </Text>
        ),
      });
      result.push({
        value: item.contribution,
        frontColor: "#16A34A",
        spacing: isLast ? 0 : 14,
        topLabelComponent: () => (
          <Text
            style={{
              fontSize: 7.5,
              color: theme.colors.onSurfaceVariant,
              fontWeight: "700",
              marginBottom: 2,
            }}
          >
            {item.contribution > 0
              ? formatShortCurrency(item.contribution)
              : ""}
          </Text>
        ),
      });
    });
    return result;
  }, [monthlyTrends, theme]);

  const renderSection = (
    title: string,
    subtitle: string,
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    iconColor: string,
    data: PieDataItem[],
    totalAmount: number,
  ) => {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.sectionIconBg,
                { backgroundColor: `${iconColor}18` },
              ]}
            >
              <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                {title}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {subtitle}
              </Text>
            </View>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "800", color: iconColor }}
            >
              {formatCurrency(totalAmount)}
            </Text>
          </View>

          {data.length > 0 ? (
            <View style={styles.sideBySideRow}>
              {/* Left Column: Clean Donut Chart */}
              <View style={styles.donutLeftCol}>
                <PieChart
                  data={data}
                  donut
                  showText={false}
                  radius={58}
                  innerRadius={40}
                  strokeWidth={2}
                  strokeColor={theme.colors.surface}
                  centerLabelComponent={() => (
                    <View style={styles.centerLabel}>
                      <Text
                        style={[
                          styles.centerValue,
                          { color: theme.colors.onSurface },
                        ]}
                      >
                        {data.length}
                      </Text>
                      <Text
                        style={[
                          styles.centerText,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        Types
                      </Text>
                    </View>
                  )}
                />
              </View>

              {/* Right Column: Clean Legend List */}
              <View style={styles.listRightCol}>
                {data.map((item, index) => {
                  const percent =
                    totalAmount > 0 ? (item.value / totalAmount) * 100 : 0;
                  const formattedPercent =
                    percent >= 10
                      ? `${Math.round(percent)}%`
                      : `${percent.toFixed(1)}%`;

                  return (
                    <View key={index} style={styles.listItem}>
                      <View style={styles.listItemHeader}>
                        <View style={styles.labelRow}>
                          <View
                            style={[
                              styles.dot,
                              { backgroundColor: item.color },
                            ]}
                          />
                          <Text
                            variant="bodyMedium"
                            style={{ fontWeight: "600", flex: 1 }}
                            numberOfLines={1}
                          >
                            {item.label}
                          </Text>
                        </View>
                        <Text
                          variant="bodyMedium"
                          style={{ fontWeight: "700", marginLeft: 4 }}
                        >
                          {formatCurrency(item.value)}
                        </Text>
                      </View>

                      <View style={styles.progressRow}>
                        <ProgressBar
                          progress={percent / 100}
                          color={item.color}
                          style={styles.progressBar}
                        />
                        <Text
                          variant="labelSmall"
                          style={{
                            color: theme.colors.onSurfaceVariant,
                            fontSize: 10,
                            fontWeight: "600",
                            width: 38,
                            textAlign: "right",
                          }}
                        >
                          {formattedPercent}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="chart-arc"
                size={36}
                color={theme.colors.outline}
              />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.outline, marginTop: 8 }}
              >
                No transaction data for this period
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Date Range Selection Bar */}
      <View style={styles.filterSection}>
        <Text
          variant="labelMedium"
          style={{
            color: theme.colors.onSurfaceVariant,
            marginBottom: 8,
            fontWeight: "600",
            letterSpacing: 0.3,
          }}
        >
          Date Filter
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <Chip
            selected={selectedPreset === "THIS_MONTH"}
            onPress={() => handlePresetSelect("THIS_MONTH")}
            style={styles.chip}
            compact
          >
            This Month
          </Chip>
          <Chip
            selected={selectedPreset === "LAST_MONTH"}
            onPress={() => handlePresetSelect("LAST_MONTH")}
            style={styles.chip}
            compact
          >
            Last Month
          </Chip>
          <Chip
            selected={selectedPreset === "THIS_QUARTER"}
            onPress={() => handlePresetSelect("THIS_QUARTER")}
            style={styles.chip}
            compact
          >
            This Quarter
          </Chip>
          <Chip
            selected={selectedPreset === "ALL_TIME"}
            onPress={() => handlePresetSelect("ALL_TIME")}
            style={styles.chip}
            compact
          >
            All Time
          </Chip>
          <Chip
            selected={selectedPreset === "CUSTOM"}
            onPress={() => handlePresetSelect("CUSTOM")}
            icon="calendar-range"
            style={styles.chip}
            compact
          >
            Custom
          </Chip>
        </ScrollView>

        <TouchableOpacity
          onPress={() => setIsDatePickerOpen(true)}
          activeOpacity={0.7}
        >
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.primary,
              marginTop: 8,
              fontWeight: "600",
            }}
          >
            📅 {dateRangeLabel} (Tap to change)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal for Custom Range */}
      <DatePickerModal
        locale="en"
        mode="range"
        visible={isDatePickerOpen}
        onDismiss={onDismissDatePicker}
        startDate={dateRange.fromDate}
        endDate={dateRange.toDate}
        onConfirm={onConfirmDateRange}
      />

      {/* Financial Comparison & Balance Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.summaryCardContent}>
          <Text
            variant="labelMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              fontWeight: "700",
              letterSpacing: 0.5,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Financial Comparison & Balance
          </Text>

          <View style={styles.comparisonGrid}>
            {/* Outflow Box (Work + Expense) */}
            <View
              style={[
                styles.comparisonBox,
                { backgroundColor: "#FFF7ED", borderColor: "#FFEDD5" },
              ]}
            >
              <View style={styles.boxHeader}>
                <MaterialCommunityIcons
                  name="arrow-up-circle-outline"
                  size={18}
                  color="#EA580C"
                />
                <Text
                  variant="labelSmall"
                  style={{ color: "#9A3412", fontWeight: "700" }}
                >
                  Operating Outflow
                </Text>
              </View>
              <Text
                variant="titleLarge"
                style={{ color: "#C2410C", fontWeight: "800", marginTop: 4 }}
              >
                {formatCurrency(totalOutflow)}
              </Text>
              <Text
                variant="labelSmall"
                style={{ color: "#9A3412", opacity: 0.8, marginTop: 2 }}
              >
                Work: {formatCurrency(totalWork)} | Exp:{" "}
                {formatCurrency(totalExpense)}
              </Text>
            </View>

            {/* Contribution Box */}
            <View
              style={[
                styles.comparisonBox,
                { backgroundColor: "#F0FDF4", borderColor: "#DCFCE7" },
              ]}
            >
              <View style={styles.boxHeader}>
                <MaterialCommunityIcons
                  name="hand-coin-outline"
                  size={18}
                  color="#16A34A"
                />
                <Text
                  variant="labelSmall"
                  style={{ color: "#166534", fontWeight: "700" }}
                >
                  Contributions
                </Text>
              </View>
              <Text
                variant="titleLarge"
                style={{ color: "#15803D", fontWeight: "800", marginTop: 4 }}
              >
                {formatCurrency(totalContribution)}
              </Text>
              <Text
                variant="labelSmall"
                style={{ color: "#166534", opacity: 0.8, marginTop: 2 }}
              >
                Total Inflow Received
              </Text>
            </View>
          </View>

          {/* Ratio Comparison Bar */}
          <View style={styles.comparisonBarContainer}>
            <View style={styles.comparisonBarHeader}>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Outflow vs Contribution Ratio
              </Text>
              <Text
                variant="labelSmall"
                style={{
                  fontWeight: "700",
                  color:
                    totalOutflow > 0 && totalContribution >= totalOutflow
                      ? "#16A34A"
                      : "#EA580C",
                }}
              >
                {totalOutflow > 0 ? `${coveragePercent.toFixed(1)}%` : "N/A"}
              </Text>
            </View>

            <ProgressBar
              progress={
                totalOutflow > 0
                  ? Math.min(1, totalContribution / totalOutflow)
                  : 0
              }
              color={totalContribution >= totalOutflow ? "#16A34A" : "#EA580C"}
              style={styles.comparisonProgressBar}
            />

            {/* Net Status Pill */}
            <View
              style={[
                styles.netStatusPill,
                {
                  backgroundColor: netBalance >= 0 ? "#DCFCE7" : "#FFEDD5",
                },
              ]}
            >
              <MaterialCommunityIcons
                name={netBalance >= 0 ? "check-circle" : "information-outline"}
                size={14}
                color={netBalance >= 0 ? "#15803D" : "#C2410C"}
              />
              <Text
                variant="labelSmall"
                style={{
                  color: netBalance >= 0 ? "#15803D" : "#C2410C",
                  fontWeight: "700",
                }}
              >
                {netBalance >= 0
                  ? `Net Surplus: +${formatCurrency(netBalance)}`
                  : `Net Deficit: -${formatCurrency(Math.abs(netBalance))} (${coveragePercent.toFixed(1)}% Covered)`}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Monthly Trend Comparison Chart Card (Past 6 Months) */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.summaryCardContent}>
          <View style={styles.chartHeaderColumn}>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "700", color: theme.colors.onSurface }}
            >
              6-Month Trend & Comparison
            </Text>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                marginBottom: 6,
              }}
            >
              Outflow (Expense + Work) vs Contributions
            </Text>

            {/* Chart Legend Wrapped Line */}
            <View style={styles.trendLegendRow}>
              <View style={styles.trendLegendItem}>
                <View
                  style={[
                    styles.trendLegendDot,
                    { backgroundColor: "#EA580C" },
                  ]}
                />
                <Text
                  variant="labelSmall"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: "600",
                  }}
                >
                  Outflow
                </Text>
              </View>
              <View style={styles.trendLegendItem}>
                <View
                  style={[
                    styles.trendLegendDot,
                    { backgroundColor: "#16A34A" },
                  ]}
                />
                <Text
                  variant="labelSmall"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: "600",
                  }}
                >
                  Contributions
                </Text>
              </View>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : (
            <View style={styles.barChartWrapper}>
              <BarChart
                data={groupedBarData}
                barWidth={12}
                spacing={14}
                roundedTop
                hideRules={false}
                rulesColor={`${theme.colors.outline}18`}
                rulesType="dashed"
                xAxisThickness={1}
                xAxisColor={`${theme.colors.outline}30`}
                yAxisThickness={0}
                yAxisTextStyle={{
                  color: theme.colors.onSurfaceVariant,
                  fontSize: 9,
                  fontWeight: "500",
                }}
                formatYLabel={(val) =>
                  val ? formatShortCurrency(Number(val)) : "0"
                }
                xAxisLabelTextStyle={{
                  color: theme.colors.onSurface,
                  fontSize: 10,
                  fontWeight: "600",
                  width: 44,
                  textAlign: "center",
                }}
                noOfSections={3}
                maxValue={maxChartValue}
                isAnimated
                animationDuration={600}
                barBorderRadius={3}
                height={170}
                initialSpacing={10}
              />
            </View>
          )}
        </Card.Content>
      </Card>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.outline, marginTop: 12 }}
          >
            Loading breakdown charts...
          </Text>
        </View>
      ) : (
        <>
          {/* Expenses by Type Donut Chart */}
          {renderSection(
            "Expenses by Type",
            "Excludes internal transfers",
            "wallet-outline",
            "#FF9800",
            expenseData,
            totalExpense,
          )}

          {/* Work by Type Donut Chart */}
          {renderSection(
            "Work by Type",
            "Total work performed by type",
            "briefcase-outline",
            "#2196F3",
            workData,
            totalWork,
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: CONTAINER_PADDING,
    paddingBottom: CONTAINER_PADDING * 2,
  },
  filterSection: {
    marginBottom: UI_ELEMENTS_GAP,
  },
  chipRow: {
    gap: 8,
  },
  chip: {
    marginRight: 4,
  },
  summaryCardContent: {
    padding: 16,
  },
  comparisonGrid: {
    flexDirection: "row",
    gap: 12,
  },
  comparisonBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  boxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  comparisonBarContainer: {
    marginTop: 16,
    gap: 6,
  },
  comparisonBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  comparisonProgressBar: {
    height: 8,
    borderRadius: 4,
  },
  netStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  chartHeaderColumn: {
    marginBottom: 8,
  },
  trendLegendRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginTop: 2,
  },
  trendLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLoading: {
    height: 170,
    justifyContent: "center",
    alignItems: "center",
  },
  barChartWrapper: {
    alignItems: "center",
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    marginBottom: UI_ELEMENTS_GAP,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  sectionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sideBySideRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 8,
  },
  donutLeftCol: {
    alignItems: "center",
    justifyContent: "center",
    width: 125,
    marginTop: 6,
  },
  centerLabel: {
    alignItems: "center",
  },
  centerValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  centerText: {
    fontSize: 9,
  },
  listRightCol: {
    flex: 1,
    paddingLeft: 12,
    gap: 10,
  },
  listItem: {
    gap: 3,
  },
  listItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },
  loadingContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default MonthlyBreakdownScreen;
