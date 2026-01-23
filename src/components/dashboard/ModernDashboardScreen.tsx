import React, { useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, RefreshControl } from "react-native";
import { Text, useTheme, SegmentedButtons } from "react-native-paper";
import QuickStatsSection from "./QuickStatsSection";
import EnhancedLineChart from "./EnhancedLineChart";
import PieChartSection from "./PieChartSection";
import UserPerformanceChart from "./UserPerformanceChart";
import MonthlyComparisonCard from "./MonthlyComparisonCard";
import RecentActivityFeed from "./RecentActivityFeed";
import TopPerformersCarousel from "./TopPerformersCarousel";
import WeeklyTrendCard from "./WeeklyTrendCard";
import TopCategoriesCard from "./TopCategoriesCard";
import BalanceOverviewCard from "./BalanceOverviewCard";
import SummaryInsightsCard from "./SummaryInsightsCard";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import { SafeAreaView } from "react-native-safe-area-context";

type TabValue = "overview" | "analytics" | "insights";

const ModernDashboardScreen: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleUserSelect = useCallback((userId: string) => {
    // setUser(userId); // Placeholder for future implementation
    // eslint-disable-next-line no-console
    console.log("Selected user:", userId);
  }, []);

  const renderOverviewTab = () => (
    <>
      {/* Quick Stats - Most important at top */}
      <QuickStatsSection key={`stats-${refreshKey}`} />

      {/* Top Performers Carousel */}
      <TopPerformersCarousel
        key={`performers-${refreshKey}`}
        onUserSelect={handleUserSelect}
      />

      {/* Expense Pie Chart - The round donut chart */}
      <PieChartSection type="expense" key={`expense-pie-${refreshKey}`} />

      {/* Weekly Trend with dual line chart */}
      <WeeklyTrendCard key={`weekly-${refreshKey}`} />

      {/* Monthly Comparison */}
      <MonthlyComparisonCard key={`monthly-${refreshKey}`} />

      {/* Work Pie Chart */}
      <PieChartSection type="work" key={`work-pie-${refreshKey}`} />

      {/* Balance Overview with running balance */}
      <BalanceOverviewCard key={`balance-${refreshKey}`} />

      {/* Line Chart */}
      <EnhancedLineChart key={`chart-${refreshKey}`} />
    </>
  );

  const renderAnalyticsTab = () => (
    <>
      {/* Top Categories - Work */}
      <TopCategoriesCard key={`cat-work-${refreshKey}`} type="work" />

      {/* User Performance Bar Chart - Work */}
      <UserPerformanceChart
        key={`perf-work-${refreshKey}`}
        type="work"
        onUserSelect={handleUserSelect}
      />

      {/* Work Pie Chart */}
      <PieChartSection type="work" key={`work-pie-${refreshKey}`} />

      {/* Top Categories - Expense */}
      <TopCategoriesCard key={`cat-expense-${refreshKey}`} type="expense" />

      {/* User Performance Bar Chart - Expense */}
      <UserPerformanceChart
        key={`perf-expense-${refreshKey}`}
        type="expense"
        onUserSelect={handleUserSelect}
      />

      {/* Expense Pie Chart */}
      <PieChartSection type="expense" key={`expense-pie-${refreshKey}`} />
    </>
  );

  const renderInsightsTab = () => (
    <>
      {/* AI-Powered Insights */}
      <SummaryInsightsCard key={`insights-${refreshKey}`} />

      {/* Recent Activity Feed */}
      <RecentActivityFeed key={`activity-${refreshKey}`} />

      {/* Balance Overview */}
      <BalanceOverviewCard key={`balance-${refreshKey}`} />

      {/* Weekly Trend */}
      <WeeklyTrendCard key={`weekly-${refreshKey}`} />

      {/* Quick Stats */}
      <QuickStatsSection key={`stats-${refreshKey}`} />
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverviewTab();
      case "analytics":
        return renderAnalyticsTab();
      case "insights":
        return renderInsightsTab();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text
            variant="headlineMedium"
            style={[styles.headerTitle, { color: theme.colors.onBackground }]}
          >
            Dashboard
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Welcome back! Here&apos;s your complete overview
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabValue)}
          buttons={[
            { value: "overview", label: "Overview", icon: "view-dashboard" },
            { value: "analytics", label: "Analytics", icon: "chart-bar" },
            { value: "insights", label: "Insights", icon: "lightbulb-outline" },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {renderContent()}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: UI_ELEMENTS_GAP,
    paddingVertical: UI_ELEMENTS_GAP,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "bold",
  },
  tabContainer: {
    paddingHorizontal: UI_ELEMENTS_GAP,
    paddingBottom: UI_ELEMENTS_GAP / 2,
  },
  segmentedButtons: {},
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: UI_ELEMENTS_GAP * 2,
  },
  bottomSpacer: {
    height: 80,
  },
});

export default ModernDashboardScreen;
