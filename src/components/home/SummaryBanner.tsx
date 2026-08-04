import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { DashboardSummary } from "../../../services/DashboardService";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SummaryBannerProps {
  summary: DashboardSummary | null;
  loading: boolean;
}

const formatAmount = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toFixed(0)}`;
};

const SummaryBanner: React.FC<SummaryBannerProps> = ({ summary, loading }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();

  if (loading || !summary) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: "rgba(255,255,255,0.15)" },
        ]}
      >
        <Text style={styles.loadingText}>Loading summary...</Text>
      </View>
    );
  }

  const totalMonthly = summary.totalWorkAmount + summary.totalExpenseAmount;

  return (
    <View
      style={[styles.container, { backgroundColor: "rgba(255,255,255,0.15)" }]}
    >
      <Text style={styles.totalLabel}>This Month</Text>
      <Text style={styles.totalAmount}>{formatAmount(totalMonthly)}</Text>

      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <MaterialCommunityIcons
            name="briefcase-variant"
            size={14}
            color="rgba(255,255,255,0.8)"
          />
          <Text style={styles.breakdownText}>
            Works: {formatAmount(summary.totalWorkAmount)}
          </Text>
        </View>
        <View style={styles.breakdownItem}>
          <MaterialCommunityIcons
            name="wallet"
            size={14}
            color="rgba(255,255,255,0.8)"
          />
          <Text style={styles.breakdownText}>
            Expenses: {formatAmount(summary.totalExpenseAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.countsRow}>
        <Text style={styles.countText}>{summary.workCount} Works</Text>
        <Text style={styles.countDot}>•</Text>
        <Text style={styles.countText}>{summary.expenseCount} Expenses</Text>
        <Text style={styles.countDot}>•</Text>
        <Text style={styles.countText}>
          {summary.contributionCount} Contribs
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  loadingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    textAlign: "center",
  },
  totalLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  totalAmount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 2,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  breakdownText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "500",
  },
  countsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  countDot: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
  },
});

export default SummaryBanner;
