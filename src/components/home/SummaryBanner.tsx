import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { DashboardSummary } from "../../../services/DashboardService";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SummaryBannerProps {
  summary: DashboardSummary | null;
  loading: boolean;
  onPress?: () => void;
}

const formatAmount = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)}K`;
  }
  return `₹${amount.toFixed(0)}`;
};

const SummaryBanner: React.FC<SummaryBannerProps> = ({
  summary,
  loading,
  onPress,
}) => {
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
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.container, { backgroundColor: "rgba(255,255,255,0.15)" }]}
      accessibilityLabel="View Monthly Breakdown"
      accessibilityRole="button"
    >
      {/* Top Header Row: Total Monthly on Left, Contributions Pill on Right (Opposite) */}
      <View style={styles.topRow}>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={styles.totalLabel}>This Month</Text>
            {onPress && (
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color="rgba(255,255,255,0.7)"
              />
            )}
          </View>
          <Text style={styles.totalAmount}>{formatAmount(totalMonthly)}</Text>
        </View>

        <View style={styles.contribContainer}>
          <Text style={styles.contribLabel}>Contribs</Text>
          <View style={styles.contribBadge}>
            <MaterialCommunityIcons
              name="bank-transfer-in"
              size={14}
              color="#A5D6A7"
            />
            <Text style={styles.contribAmount}>
              +{formatAmount(summary.totalContributionAmount || 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Breakdown Row for Works & Expenses */}
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

      {/* Counts Row */}
      <View style={styles.countsRow}>
        <Text style={styles.countText}>{summary.workCount} Works</Text>
        <Text style={styles.countDot}>•</Text>
        <Text style={styles.countText}>{summary.expenseCount} Expenses</Text>
        <Text style={styles.countDot}>•</Text>
        <Text style={styles.countText}>
          {summary.contributionCount} Contribs
        </Text>
      </View>
    </TouchableOpacity>
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
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
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
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 2,
  },
  contribContainer: {
    alignItems: "flex-end",
  },
  contribLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  contribBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  contribAmount: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  breakdownRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
