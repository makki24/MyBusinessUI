import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Text, useTheme, ActivityIndicator, Button } from "react-native-paper";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
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

  const [filterTypes, setFilterTypes] = useState<string[] | undefined>();
  const [filterDate, setFilterDate] = useState<string | undefined>();

  const PAGE_SIZE = 20;

  const fetchActivities = async (
    offset: number = 0,
    append: boolean = false,
    types?: string[],
    date?: string,
  ) => {
    try {
      const data = await DashboardService.getRecent(
        PAGE_SIZE,
        offset,
        types,
        date,
      );
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
    let isMounted = true;

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        fetchActivities(0, false, filterTypes, filterDate).finally(() =>
          setLoading(false),
        );
        return;
      }

      const filterAsString = (
        response?.notification.request
          .trigger as Notifications.PushNotificationTrigger
      ).remoteMessage?.data.expenseFilter;

      if (filterAsString) {
        try {
          const filter = JSON.parse(filterAsString);

          const types = filter.types;
          let dateStr;

          if (filter.lastUpdateTime) {
            const parsedDate = filter.lastUpdateTime;
            const offset = new Date().getTimezoneOffset();
            const date = new Date(
              parsedDate.year,
              parsedDate.monthValue - 1,
              parsedDate.dayOfMonth,
              parsedDate.hour,
              parsedDate.minute,
              parsedDate.second,
            );
            dateStr = new Date(
              date.getTime() - offset * 60 * 1000,
            ).toISOString();
          }

          setFilterTypes(types);
          setFilterDate(dateStr);

          fetchActivities(0, false, types, dateStr).finally(() =>
            setLoading(false),
          );
        } catch (err) {
          fetchActivities(0, false, filterTypes, filterDate).finally(() =>
            setLoading(false),
          );
        }
      } else {
        fetchActivities(0, false, filterTypes, filterDate).finally(() =>
          setLoading(false),
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities(0, false, filterTypes, filterDate);
    setRefreshing(false);
  }, [filterTypes, filterDate]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    await fetchActivities(activities.length, true, filterTypes, filterDate);
    setLoadingMore(false);
  }, [
    loadingMore,
    hasMore,
    loading,
    activities.length,
    filterTypes,
    filterDate,
  ]);

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
      {(filterTypes || filterDate) && (
        <View style={styles.filterBanner}>
          <Text style={styles.filterText}>Showing filtered activities</Text>
          <Button
            mode="text"
            onPress={() => {
              setFilterTypes(undefined);
              setFilterDate(undefined);
              setLoading(true);
              fetchActivities(0, false, undefined, undefined).finally(() =>
                setLoading(false),
              );
            }}
          >
            Clear Filter
          </Button>
        </View>
      )}
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
  filterBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "bold",
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
