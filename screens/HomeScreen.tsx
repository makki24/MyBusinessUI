import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Title, useTheme } from "react-native-paper";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import Notification from "../src/notifications/Notification";
import * as Notifications from "expo-notifications";
import { useLinkTo } from "@react-navigation/native";
import * as Linking from "expo-linking";
import crashlytics from "@react-native-firebase/crashlytics";
import { PushNotificationTrigger } from "expo-notifications/src/Notifications.types";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRecoilValue } from "recoil";
import { userState } from "../recoil/atom";
import { CONTAINER_PADDING, SHADOW } from "../src/styles/constants";
import SummaryBanner from "../src/components/home/SummaryBanner";
import QuickActions from "../src/components/home/QuickActions";
import RecentActivityFeed from "../src/components/home/RecentActivityFeed";
import DashboardService, {
  DashboardSummary,
  RecentActivity,
} from "../services/DashboardService";

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const linkTo = useLinkTo();
  const theme = useTheme();
  const loggedInUser = useRecoilValue(userState);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!isMounted || !response?.notification) {
          return;
        }
        if (!response) return;
        const scheme = Linking.createURL("");
        const url = (
          response?.notification.request.trigger as PushNotificationTrigger
        ).remoteMessage.data.url.split(scheme)[1];
        linkTo(`/${url}`);
      })
      .catch((error) => {
        crashlytics().recordError(error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setSummaryLoading(true);
      setRecentLoading(true);

      const [summaryData, recentData] = await Promise.all([
        DashboardService.getSummary(),
        DashboardService.getRecent(5),
      ]);

      setSummary(summaryData);
      setRecentActivities(recentData);
    } catch (error) {
      // Silently handle errors — dashboard is non-critical
      // eslint-disable-next-line no-console
      console.warn("Dashboard load error:", error);
    } finally {
      setSummaryLoading(false);
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

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

  const quickActions = useMemo(
    () => [
      {
        label: "+ Expense",
        icon: "wallet-plus" as keyof typeof MaterialCommunityIcons.glyphMap,
        color: "#FF9800",
        onPress: () =>
          navigation.navigate("ExpenseStack", {
            screen: "ExpenseSelection",
            params: { title: "Select Expense" },
          }),
      },
      {
        label: "+ Work",
        icon: "briefcase-plus" as keyof typeof MaterialCommunityIcons.glyphMap,
        color: "#2196F3",
        onPress: () =>
          navigation.navigate("WorkStack", {
            screen: "Work",
            params: { action: "add_work" },
          }),
      },
      {
        label: "+ Contrib",
        icon: "bank-transfer-in" as keyof typeof MaterialCommunityIcons.glyphMap,
        color: "#4CAF50",
        onPress: () =>
          navigation.navigate("ProfileStack", {
            screen: "AddContribution",
            params: { title: "Create Contribution" },
          }),
      },
      {
        label: "Attd",
        icon: "calendar-check" as keyof typeof MaterialCommunityIcons.glyphMap,
        color: "#795548",
        onPress: () =>
          navigation.navigate("WorkStack", {
            screen: "Work",
            params: { action: "add_attendance" },
          }),
      },
      {
        label: "Settlement",
        icon: "scale-balance" as keyof typeof MaterialCommunityIcons.glyphMap,
        color: "#9C27B0",
        onPress: () =>
          navigation.navigate("HomeStack", {
            screen: "SettlementScreen",
            params: { title: "Settlement (حساب)" },
          }),
      },
    ],
    [navigation],
  );

  const styles = useMemo(() => {
    const { width } = Dimensions.get("window");
    const cardWidth = (width - CONTAINER_PADDING * 3) / 2;

    return StyleSheet.create({
      container: {
        backgroundColor: theme.colors.background,
        minHeight: "100%",
      },
      headerGradient: {
        padding: CONTAINER_PADDING,
        paddingTop: CONTAINER_PADDING,
        paddingBottom: CONTAINER_PADDING * 1.5,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
      },
      welcomeText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
      },
      cardsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: CONTAINER_PADDING,
        paddingBottom: CONTAINER_PADDING,
      },
      cardContainer: {
        width: cardWidth,
        marginBottom: 12,
        borderRadius: 16,
        ...SHADOW,
        elevation: 2,
      },
      cardContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        minHeight: 72,
      },
      iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
      },
      cardTitle: {
        fontSize: 15,
        fontWeight: "600",
        flex: 1,
      },
    });
  }, [theme]);

  // Navigation card data
  const navCards = [
    {
      title: "Work",
      icon: "briefcase-variant-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
      onPress: () => navigation.navigate("WorkStack", { screen: "Work" }),
    },
    {
      title: "Expense",
      icon: "wallet-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
      onPress: () =>
        navigation.navigate("ExpenseStack", { screen: "Expenses" }),
    },
    {
      title: "Contribution",
      icon: "bank-transfer-in" as keyof typeof MaterialCommunityIcons.glyphMap,
      onPress: () =>
        navigation.navigate("ProfileStack", {
          screen: "ContributionScreen",
          params: { title: "My Contributions" },
        }),
    },
    {
      title: "Users",
      icon: "account-group-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
      onPress: () => navigation.navigate("UsersStack", { screen: "Users" }),
    },
    {
      title: "Quick Buy",
      icon: "shopping-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
      onPress: () =>
        navigation.navigate("HomeStack", {
          screen: "QuickBuyScreen",
        }),
    },
    {
      title: "Settlement",
      icon: "scale-balance" as keyof typeof MaterialCommunityIcons.glyphMap,
      onPress: () =>
        navigation.navigate("HomeStack", {
          screen: "SettlementScreen",
          params: { title: "Settlement (حساب)" },
        }),
    },
    {
      title: "Dashboard",
      icon: "view-dashboard-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
      onPress: () =>
        navigation.navigate("DashboardStack", { screen: "Dashboard" }),
    },
    {
      title: "Sale",
      icon: "cash-register" as keyof typeof MaterialCommunityIcons.glyphMap,
      onPress: () => navigation.navigate("SaleStack", { screen: "Sale" }),
    },
    {
      title: "Admin",
      icon: "shield-account-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
      onPress: () =>
        navigation.navigate("HomeStack", {
          screen: "AdminStack",
          params: { title: "Admin" },
        }),
    },
  ];

  // Gradient Colors
  const gradientColors = [
    theme.colors.primary,
    theme.colors.secondary || "#2E7D32",
  ] as [string, string];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header + Summary Banner */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Title style={styles.welcomeText}>
          {loggedInUser
            ? `Welcome, ${loggedInUser.name.split(" ")[0]}`
            : "MyBusiness"}
        </Title>
        <SummaryBanner
          summary={summary}
          loading={summaryLoading}
          onPress={() =>
            navigation.navigate("HomeStack", {
              screen: "MonthlyBreakdownScreen",
              params: { title: "Monthly Summary" },
            })
          }
        />
      </LinearGradient>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Recent Activity Feed */}
      <RecentActivityFeed
        activities={recentActivities}
        loading={recentLoading}
        onItemPress={handleActivityPress}
        onViewAll={() =>
          navigation.navigate("HomeStack", { screen: "AllActivityScreen" })
        }
      />

      {/* Navigation Grid */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: theme.colors.onSurfaceVariant,
            letterSpacing: 0.3,
            marginBottom: 10,
          }}
        >
          Navigate
        </Text>
      </View>
      <View style={styles.cardsContainer}>
        {navCards.map((card) => (
          <TouchableOpacity
            key={card.title}
            onPress={card.onPress}
            style={[
              styles.cardContainer,
              { backgroundColor: theme.colors.surface },
            ]}
            accessibilityLabel={card.title}
            accessibilityRole="button"
          >
            <View style={styles.cardContent}>
              <LinearGradient
                colors={
                  [theme.colors.background, theme.colors.surface] as [
                    string,
                    string,
                  ]
                }
                style={styles.iconContainer}
              >
                <MaterialCommunityIcons
                  name={card.icon}
                  size={32}
                  color={theme.colors.primary}
                />
              </LinearGradient>
              <Text
                style={[styles.cardTitle, { color: theme.colors.onSurface }]}
              >
                {card.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Notification />
    </ScrollView>
  );
};

export default HomeScreen;
