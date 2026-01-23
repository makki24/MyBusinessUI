import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  useTheme,
  Surface,
  ActivityIndicator,
  Avatar,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import { useRecoilValue } from "recoil";
import { usersState } from "../../../recoil/atom";
import reportService from "../../../services/ReportService";
import { Filter } from "../../../types";

interface PerformerData {
  userId: string;
  name: string;
  totalEarned: number;
  totalSpent: number;
  netBalance: number;
  transactionCount: number;
  trend: "up" | "down" | "neutral";
  trendPercent: number;
}

const CARD_WIDTH = 160;
const CARD_MARGIN = 12;

const GRADIENTS = [
  ["#667EEA", "#764BA2"] as const,
  ["#11998E", "#38EF7D"] as const,
  ["#FC466B", "#3F5EFB"] as const,
  ["#F093FB", "#F5576C"] as const,
  ["#4FACFE", "#00F2FE"] as const,
  ["#43E97B", "#38F9D7"] as const,
  ["#FA709A", "#FEE140"] as const,
  ["#30CFD0", "#330867"] as const,
];

interface TopPerformersCarouselProps {
  onUserSelect?: (userId: string) => void;
}

const TopPerformersCarousel: React.FC<TopPerformersCarouselProps> = ({
  onUserSelect,
}) => {
  const theme = useTheme();
  const users = useRecoilValue(usersState);
  const [performers, setPerformers] = useState<PerformerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

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
      const [workData, expenseData] = await Promise.all([
        reportService.getWorkSummaryByType(createFilter()),
        reportService.getExpenseSummaryByType(createFilter()),
      ]);

      // Aggregate data by user
      const userMap = new Map<string, PerformerData>();

      // Process work data
      (workData || []).forEach((item: any) => {
        if (item.subTransactions) {
          item.subTransactions.forEach((sub: any) => {
            if (sub.receiver?.id) {
              const userId = sub.receiver.id;
              const existing = userMap.get(userId) || {
                userId,
                name: sub.receiver.name || "Unknown",
                totalEarned: 0,
                totalSpent: 0,
                netBalance: 0,
                transactionCount: 0,
                trend: "neutral" as const,
                trendPercent: 0,
              };
              existing.totalEarned += sub.totalAmount || 0;
              existing.transactionCount += 1;
              userMap.set(userId, existing);
            }
          });
        }
      });

      // Process expense data
      (expenseData || []).forEach((item: any) => {
        if (item.subTransactions) {
          item.subTransactions.forEach((sub: any) => {
            if (sub.receiver?.id) {
              const userId = sub.receiver.id;
              const existing = userMap.get(userId);
              if (existing) {
                existing.totalSpent += sub.totalAmount || 0;
              }
            }
          });
        }
      });

      // Calculate net balance and create final array
      const performersList = Array.from(userMap.values())
        .map((p) => ({
          ...p,
          netBalance: p.totalEarned - p.totalSpent,
          trend: (p.totalEarned > p.totalSpent ? "up" : "down") as
            | "up"
            | "down",
          trendPercent: Math.abs(
            p.totalSpent > 0
              ? ((p.totalEarned - p.totalSpent) / p.totalSpent) * 100
              : 100,
          ),
        }))
        .sort((a, b) => b.totalEarned - a.totalEarned)
        .slice(0, 10);

      setPerformers(performersList);
    } catch (e) {
      setError(e.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatValue = (value: number): string => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Top Performers
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </Surface>
    );
  }

  if (error || performers.length === 0) {
    return null; // Don't show empty section
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          🏆 Top Performers
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          This Month
        </Text>
      </View>

      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
      >
        {performers.map((performer, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_MARGIN),
            index * (CARD_WIDTH + CARD_MARGIN),
            (index + 1) * (CARD_WIDTH + CARD_MARGIN),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.95, 1, 0.95],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={performer.userId}
              style={[
                styles.cardContainer,
                {
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => onUserSelect?.(performer.userId)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={GRADIENTS[index % GRADIENTS.length]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  {/* Rank Badge */}
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>

                  {/* Avatar */}
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {getInitials(performer.name)}
                    </Text>
                  </View>

                  {/* Name */}
                  <Text style={styles.name} numberOfLines={1}>
                    {performer.name.split(" ")[0]}
                  </Text>

                  {/* Total Earned */}
                  <Text style={styles.amount}>
                    {formatValue(performer.totalEarned)}
                  </Text>

                  {/* Trend */}
                  <View style={styles.trendContainer}>
                    <MaterialCommunityIcons
                      name={
                        performer.trend === "up"
                          ? "trending-up"
                          : "trending-down"
                      }
                      size={14}
                      color="#FFFFFF"
                    />
                    <Text style={styles.trendText}>
                      {performer.trendPercent.toFixed(0)}%
                    </Text>
                  </View>

                  {/* Transaction Count */}
                  <Text style={styles.txCount}>
                    {performer.transactionCount} transactions
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: UI_ELEMENTS_GAP / 2,
  },
  container: {
    borderRadius: 16,
    marginHorizontal: UI_ELEMENTS_GAP,
    padding: UI_ELEMENTS_GAP,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: UI_ELEMENTS_GAP,
    marginBottom: UI_ELEMENTS_GAP,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
  },
  loadingContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: UI_ELEMENTS_GAP,
    paddingBottom: 8,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rankText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  name: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  trendText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
  },
  txCount: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    marginTop: 4,
  },
});

export default TopPerformersCarousel;
