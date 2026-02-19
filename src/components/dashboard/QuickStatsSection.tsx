import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import QuickStatsCard from "./QuickStatsCard";
import DashBoardService, { DashboardStats } from "./DashboardService";
import { UI_ELEMENTS_GAP } from "../../styles/constants";

const QuickStatsSection: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await DashBoardService.getDashboardStats();
      setStats(data);
    } catch (e) {
      setError(e.message || "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: theme.colors.error }}>
          {error || "No data available"}
        </Text>
      </View>
    );
  }

  const netTrend =
    stats.netBalance > 0 ? "up" : stats.netBalance < 0 ? "down" : "neutral";

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Overview
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <QuickStatsCard
          title="To Receive"
          value={stats.totalToReceive}
          gradientColors={["#4CAF50", "#2E7D32"]}
          subtitle="Total owed to you"
        />
        <QuickStatsCard
          title="To Pay"
          value={stats.totalToPay}
          gradientColors={["#F44336", "#C62828"]}
          subtitle="Total you owe"
        />
        <QuickStatsCard
          title="Net Balance"
          value={stats.netBalance}
          gradientColors={
            stats.netBalance >= 0
              ? ["#2196F3", "#1565C0"]
              : ["#FF9800", "#E65100"]
          }
          trend={netTrend}
          subtitle={stats.netBalance >= 0 ? "Positive" : "Negative"}
        />
        <QuickStatsCard
          title="Active Users"
          value={stats.activeUsers}
          gradientColors={["#9C27B0", "#6A1B9A"]}
          subtitle="With transactions"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: UI_ELEMENTS_GAP,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: UI_ELEMENTS_GAP,
    marginHorizontal: UI_ELEMENTS_GAP,
  },
  scrollContent: {
    paddingHorizontal: UI_ELEMENTS_GAP,
    paddingBottom: UI_ELEMENTS_GAP / 2,
  },
  loadingContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: UI_ELEMENTS_GAP,
  },
});

export default QuickStatsSection;
