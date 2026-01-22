import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import { PieChart } from "react-native-gifted-charts";
import reportService from "../../../services/ReportService";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import { Filter } from "../../../types";

interface PieDataItem {
  value: number;
  color: string;
  text: string;
  label: string;
}

const CHART_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#C9CBCF",
  "#7BC225",
  "#F7464A",
  "#46BFBD",
];

interface PieChartSectionProps {
  type: "expense" | "work";
}

const PieChartSection: React.FC<PieChartSectionProps> = ({ type }) => {
  const theme = useTheme();
  const [pieData, setPieData] = useState<PieDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

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
        type === "expense"
          ? reportService.getExpenseSummaryByType
          : reportService.getWorkSummaryByType;

      const result = await api(createFilter());

      if (result && result.length > 0) {
        const totalAmount = result.reduce(
          (sum: number, item: any) => sum + (item.totalAmount || 0),
          0,
        );
        setTotal(totalAmount);

        const chartData: PieDataItem[] = result
          .filter((item: any) => item.totalAmount > 0)
          .slice(0, 8) // Limit to top 8 for clarity
          .map((item: any, index: number) => ({
            value: item.totalAmount,
            color: CHART_COLORS[index % CHART_COLORS.length],
            text: `${Math.round((item.totalAmount / totalAmount) * 100)}%`,
            label: item.baseTransactionType?.name || "Unknown",
          }));

        setPieData(chartData);
      } else {
        setPieData([]);
      }
    } catch (e) {
      setError(e.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const title = type === "expense" ? "Expenses by Type" : "Work by Type";

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        <Text style={{ color: theme.colors.error }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        This month • Total: {total.toLocaleString()}
      </Text>

      {pieData.length > 0 ? (
        <View style={styles.chartWrapper}>
          <View style={styles.pieContainer}>
            <PieChart
              data={pieData}
              donut
              showText
              textColor="#fff"
              radius={80}
              innerRadius={50}
              textSize={10}
              focusOnPress
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <Text
                    style={[
                      styles.centerValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {pieData.length}
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

          <View style={styles.legendContainer}>
            {pieData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Text
                  style={[styles.legendText, { color: theme.colors.onSurface }]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.legendValue,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {item.value.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            No data for this month
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: UI_ELEMENTS_GAP,
    marginVertical: UI_ELEMENTS_GAP / 2,
    padding: UI_ELEMENTS_GAP,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: UI_ELEMENTS_GAP,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  chartWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  pieContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  centerLabel: {
    alignItems: "center",
  },
  centerValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  centerText: {
    fontSize: 10,
  },
  legendContainer: {
    flex: 1,
    paddingLeft: UI_ELEMENTS_GAP,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    flex: 1,
  },
  legendValue: {
    fontSize: 11,
    fontWeight: "500",
  },
  emptyState: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PieChartSection;
