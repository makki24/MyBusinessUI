import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme, Surface, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import reportService from "../../../services/ReportService";
import { Filter } from "../../../types";

interface Insight {
  id: string;
  type: "success" | "warning" | "info" | "alert";
  icon: string;
  title: string;
  message: string;
  action?: string;
}

const INSIGHT_STYLES = {
  success: {
    gradient: ["#10B981", "#059669"] as const,
    bgColor: "#10B98115",
    iconColor: "#10B981",
  },
  warning: {
    gradient: ["#F59E0B", "#D97706"] as const,
    bgColor: "#F59E0B15",
    iconColor: "#F59E0B",
  },
  info: {
    gradient: ["#6366F1", "#4F46E5"] as const,
    bgColor: "#6366F115",
    iconColor: "#6366F1",
  },
  alert: {
    gradient: ["#EF4444", "#DC2626"] as const,
    bgColor: "#EF444415",
    iconColor: "#EF4444",
  },
};

const SummaryInsightsCard: React.FC = () => {
  const theme = useTheme();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const createFilter = (monthsAgo: number = 0): Filter => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth =
      monthsAgo === 0
        ? new Date()
        : new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {
      tags: [],
      excludeTags: [],
      fromDate: startOfMonth,
      toDate: endOfMonth,
    } as Filter;
  };

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const [currentWork, currentExpense, lastMonthWork, lastMonthExpense] =
        await Promise.all([
          reportService.getWorkSummaryByType(createFilter(0)),
          reportService.getExpenseSummaryByType(createFilter(0)),
          reportService.getWorkSummaryByType(createFilter(1)),
          reportService.getExpenseSummaryByType(createFilter(1)),
        ]);

      const sumTotal = (data: any[]) =>
        data?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0;

      const currentIncome = sumTotal(currentWork);
      const currentExpenses = sumTotal(currentExpense);
      const lastIncome = sumTotal(lastMonthWork);
      const lastExpenses = sumTotal(lastMonthExpense);

      const netCurrent = currentIncome - currentExpenses;
      const netLast = lastIncome - lastExpenses;
      const incomeChange =
        lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
      const expenseChange =
        lastExpenses > 0
          ? ((currentExpenses - lastExpenses) / lastExpenses) * 100
          : 0;

      const generatedInsights: Insight[] = [];

      // Net Balance Insight
      if (netCurrent > 0) {
        generatedInsights.push({
          id: "net-positive",
          type: "success",
          icon: "check-circle",
          title: "Positive Cash Flow",
          message: `You're earning ${formatValue(netCurrent)} more than spending this month. Great job managing your finances!`,
          action: "Keep it up!",
        });
      } else if (netCurrent < 0) {
        generatedInsights.push({
          id: "net-negative",
          type: "alert",
          icon: "alert-circle",
          title: "Spending Alert",
          message: `Expenses exceed income by ${formatValue(Math.abs(netCurrent))} this month. Consider reducing discretionary spending.`,
          action: "Review expenses",
        });
      }

      // Income Trend
      if (incomeChange > 10) {
        generatedInsights.push({
          id: "income-up",
          type: "success",
          icon: "trending-up",
          title: "Income Growing",
          message: `Your income increased by ${incomeChange.toFixed(0)}% compared to last month. Strong performance!`,
        });
      } else if (incomeChange < -10) {
        generatedInsights.push({
          id: "income-down",
          type: "warning",
          icon: "trending-down",
          title: "Income Decreased",
          message: `Income dropped by ${Math.abs(incomeChange).toFixed(0)}% from last month. Look for new opportunities.`,
          action: "Analyze causes",
        });
      }

      // Expense Trend
      if (expenseChange > 20) {
        generatedInsights.push({
          id: "expense-up",
          type: "warning",
          icon: "cash-minus",
          title: "Rising Expenses",
          message: `Expenses increased by ${expenseChange.toFixed(0)}% this month. Review your biggest spending categories.`,
          action: "See details",
        });
      } else if (expenseChange < -10) {
        generatedInsights.push({
          id: "expense-down",
          type: "success",
          icon: "piggy-bank",
          title: "Spending Reduced",
          message: `Great! You reduced expenses by ${Math.abs(expenseChange).toFixed(0)}% compared to last month.`,
        });
      }

      // Top Category Insight
      if (currentExpense && currentExpense.length > 0) {
        const topExpense = currentExpense.sort(
          (a: any, b: any) => (b.totalAmount || 0) - (a.totalAmount || 0),
        )[0];
        const topPercent =
          currentExpenses > 0
            ? ((topExpense.totalAmount || 0) / currentExpenses) * 100
            : 0;

        if (topPercent > 40) {
          generatedInsights.push({
            id: "category-focus",
            type: "info",
            icon: "chart-pie",
            title: "Category Breakdown",
            message: `"${topExpense.baseTransactionType?.name || "Unknown"}" makes up ${topPercent.toFixed(0)}% of your expenses. Consider if this can be optimized.`,
          });
        }
      }

      // Month Progress
      const dayOfMonth = new Date().getDate();
      const daysInMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      ).getDate();
      const monthProgress = (dayOfMonth / daysInMonth) * 100;

      generatedInsights.push({
        id: "month-progress",
        type: "info",
        icon: "calendar-month",
        title: "Month Progress",
        message: `You're ${monthProgress.toFixed(0)}% through the month. ${daysInMonth - dayOfMonth} days remaining to reach your goals.`,
      });

      setInsights(generatedInsights.slice(0, 4)); // Show max 4 insights
    } catch (e) {
      console.error("Failed to generate insights:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (absValue >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  useEffect(() => {
    generateInsights();
  }, []);

  if (isLoading) {
    return (
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
        elevation={2}
      >
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          🤖 Smart Insights
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Analyzing your data...
          </Text>
        </View>
      </Surface>
    );
  }

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      elevation={2}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            🤖 Smart Insights
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            AI-powered analysis of your finances
          </Text>
        </View>
      </View>

      {/* Insights List */}
      <View style={styles.insightsList}>
        {insights.map((insight, index) => {
          const style = INSIGHT_STYLES[insight.type];

          return (
            <TouchableOpacity
              key={insight.id}
              style={[styles.insightItem, { backgroundColor: style.bgColor }]}
              activeOpacity={0.7}
            >
              {/* Icon */}
              <LinearGradient
                colors={style.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <MaterialCommunityIcons
                  name={insight.icon as any}
                  size={18}
                  color="#FFFFFF"
                />
              </LinearGradient>

              {/* Content */}
              <View style={styles.insightContent}>
                <Text
                  style={[
                    styles.insightTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {insight.title}
                </Text>
                <Text
                  style={[
                    styles.insightMessage,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                  numberOfLines={2}
                >
                  {insight.message}
                </Text>
                {insight.action && (
                  <Text
                    style={[styles.insightAction, { color: style.iconColor }]}
                  >
                    {insight.action} →
                  </Text>
                )}
              </View>
            </TouchableOpacity>
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
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  insightMessage: {
    fontSize: 12,
    lineHeight: 18,
  },
  insightAction: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
});

export default SummaryInsightsCard;
