import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import {
  Text,
  useTheme,
  Surface,
  ActivityIndicator,
  ProgressBar,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import reportService from "../../../services/ReportService";
import { Filter } from "../../../types";

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

const CATEGORY_COLORS = [
  "#6366F1",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#F97316",
];

const CATEGORY_ICONS: Record<string, string> = {
  default: "folder-outline",
  salary: "cash-multiple",
  food: "food",
  transport: "car",
  utilities: "flash",
  shopping: "shopping",
  entertainment: "movie",
  health: "medical-bag",
  education: "school",
  other: "dots-horizontal",
};

interface TopCategoriesCardProps {
  type: "work" | "expense";
}

const TopCategoriesCard: React.FC<TopCategoriesCardProps> = ({ type }) => {
  const theme = useTheme();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const animatedValues = useRef<Animated.Value[]>([]);

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

  const getIcon = (name: string): string => {
    const lowerName = name.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
      if (lowerName.includes(key)) return icon;
    }
    return CATEGORY_ICONS.default;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const api =
        type === "work"
          ? reportService.getWorkSummaryByType
          : reportService.getExpenseSummaryByType;

      const result = await api(createFilter());

      if (result && result.length > 0) {
        const total = result.reduce(
          (sum: number, item: any) => sum + (item.totalAmount || 0),
          0,
        );
        setTotalAmount(total);

        const categoryData = result
          .filter((item: any) => item.totalAmount > 0)
          .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
          .slice(0, 6)
          .map((item: any, index: number) => ({
            name: item.baseTransactionType?.name || "Unknown",
            amount: item.totalAmount,
            percentage: total > 0 ? (item.totalAmount / total) * 100 : 0,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            icon: getIcon(item.baseTransactionType?.name || ""),
          }));

        setCategories(categoryData);

        // Initialize animated values
        animatedValues.current = categoryData.map(() => new Animated.Value(0));

        // Animate progress bars
        setTimeout(() => {
          Animated.stagger(
            100,
            animatedValues.current.map((anim, i) =>
              Animated.timing(anim, {
                toValue: categoryData[i].percentage / 100,
                duration: 800,
                useNativeDriver: false,
              }),
            ),
          ).start();
        }, 100);
      }
    } catch (e) {
      console.error("Failed to fetch categories:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const formatValue = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const title =
    type === "work" ? "💼 Top Work Categories" : "💰 Top Expense Categories";

  if (isLoading) {
    return (
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
        elevation={2}
      >
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </Surface>
    );
  }

  if (categories.length === 0) {
    return null;
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
            {title}
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Total: {formatValue(totalAmount)} this month
          </Text>
        </View>
      </View>

      {/* Category List */}
      <View style={styles.categoryList}>
        {categories.map((category, index) => (
          <View key={category.name} style={styles.categoryItem}>
            {/* Icon and Name */}
            <View style={styles.categoryHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${category.color}20` },
                ]}
              >
                <MaterialCommunityIcons
                  name={category.icon as any}
                  size={16}
                  color={category.color}
                />
              </View>
              <Text
                style={[styles.categoryName, { color: theme.colors.onSurface }]}
                numberOfLines={1}
              >
                {category.name}
              </Text>
              <Text
                style={[
                  styles.categoryAmount,
                  { color: theme.colors.onSurface },
                ]}
              >
                {formatValue(category.amount)}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: category.color,
                    width:
                      animatedValues.current[index]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }) || "0%",
                  },
                ]}
              />
              <View
                style={[
                  styles.progressBackground,
                  { backgroundColor: `${category.color}15` },
                ]}
              />
            </View>

            {/* Percentage */}
            <Text style={[styles.percentage, { color: category.color }]}>
              {category.percentage.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>

      {/* Footer Insight */}
      <View
        style={[
          styles.footerInsight,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <MaterialCommunityIcons
          name="information-outline"
          size={14}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}
        >
          {categories[0]?.name || "Top category"} accounts for{" "}
          {categories[0]?.percentage.toFixed(0) || 0}% of total {type}
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
    marginBottom: UI_ELEMENTS_GAP,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryList: {
    gap: 16,
  },
  categoryItem: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    position: "absolute",
    height: "100%",
    borderRadius: 4,
    zIndex: 1,
  },
  progressBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  percentage: {
    fontSize: 11,
    fontWeight: "600",
    alignSelf: "flex-end",
  },
  footerInsight: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginTop: UI_ELEMENTS_GAP,
    gap: 8,
  },
  footerText: {
    flex: 1,
    fontSize: 11,
  },
});

export default TopCategoriesCard;
