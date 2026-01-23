import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { UI_ELEMENTS_GAP } from "../../styles/constants";

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  gradientColors: readonly [string, string];
  trend?: "up" | "down" | "neutral";
}

const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  title,
  value,
  subtitle,
  gradientColors,
  trend,
}) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "";
  };

  const getTrendColor = () => {
    if (trend === "up") return "#4CAF50";
    if (trend === "down") return "#F44336";
    return theme.colors.onSurface;
  };

  return (
    <Surface style={styles.card} elevation={2}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.valueRow}>
            <Text style={styles.value} numberOfLines={1}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </Text>
            {trend && (
              <Text style={[styles.trend, { color: getTrendColor() }]}>
                {getTrendIcon()}
              </Text>
            )}
          </View>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </LinearGradient>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    minWidth: 150,
    marginRight: UI_ELEMENTS_GAP,
  },
  gradient: {
    padding: UI_ELEMENTS_GAP * 1.5,
  },
  content: {
    minHeight: 80,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 4,
  },
  trend: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 4,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
});

export default QuickStatsCard;
