import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import DashboardService, { RecentActivity } from "../services/DashboardService";
import { RecentActivityItem } from "../src/components/home/RecentActivityFeed";

interface AllActivityScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const AllActivityScreen: React.FC<AllActivityScreenProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 20;

  const fetchActivities = async (
    offset: number = 0,
    append: boolean = false,
  ) => {
    try {
      const data = await DashboardService.getRecent(PAGE_SIZE, offset);
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (append) {
        setActivities((prev) => {
          const newItems = data.filter(
            (newItem) =>
              !prev.some(
                (prevItem) =>
                  prevItem.type === newItem.type && prevItem.id === newItem.id,
              ),
          );
          return [...prev, ...newItems];
        });
      } else {
        setActivities(data);
      }
      setError(null);
    } catch (e) {
      setError("Failed to load activities");
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: "All Activity" });
    fetchActivities(0, false).finally(() => setLoading(false));
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities(0, false);
    setRefreshing(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    await fetchActivities(activities.length, true);
    setLoadingMore(false);
  }, [loadingMore, hasMore, loading, activities.length]);

  const handleActivityPress = useCallback(
    (item: RecentActivity) => {
      switch (item.type) {
        case "WORK":
          navigation.navigate("WorkStack", { screen: "Work" });
          break;
        case "EXPENSE":
          navigation.navigate("ExpenseStack", { screen: "Expenses" });
          break;
        case "CONTRIBUTION":
          navigation.navigate("ProfileStack", {
            screen: "ContributionScreen",
            params: { title: "My Contributions" },
          });
          break;
      }
    },
    [navigation],
  );

  const renderItem = ({ item }: { item: RecentActivity }) => (
    <RecentActivityItem item={item} onPress={() => handleActivityPress(item)} />
  );

  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={{ color: theme.colors.error }}>{error}</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={activities}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ padding: 16, alignItems: "center" }}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.outline }}>
              No activities found.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 12,
    gap: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
});

export default AllActivityScreen;
