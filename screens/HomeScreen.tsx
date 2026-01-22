import React, { useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
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
import {
  BORDER_RADIUS,
  CONTAINER_PADDING,
  SHADOW,
} from "../src/styles/constants";

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const linkTo = useLinkTo();
  const theme = useTheme();
  const loggedInUser = useRecoilValue(userState);

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

  const styles = useMemo(() => {
    const { width } = Dimensions.get("window");
    const cardWidth = (width - CONTAINER_PADDING * 3) / 2;

    return StyleSheet.create({
      container: {
        padding: CONTAINER_PADDING,
        paddingTop: CONTAINER_PADDING + 10,
        backgroundColor: theme.colors.background,
        minHeight: "100%",
      },
      headerGradient: {
        marginBottom: CONTAINER_PADDING * 1.5,
        padding: CONTAINER_PADDING,
        paddingTop: CONTAINER_PADDING * 2,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginTop: -CONTAINER_PADDING - 10,
        marginHorizontal: -CONTAINER_PADDING,
      },
      welcomeText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
      },
      subtitleText: {
        fontSize: 16,
        color: "#E0E0E0",
      },
      cardsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingBottom: CONTAINER_PADDING,
        marginTop: -30,
      },
      cardContainer: {
        width: cardWidth,
        marginBottom: CONTAINER_PADDING,
        borderRadius: BORDER_RADIUS,
        ...SHADOW,
        elevation: 4,
      },
      cardContent: {
        alignItems: "center",
        padding: CONTAINER_PADDING,
        justifyContent: "center",
        minHeight: 140,
      },
      iconContainer: {
        marginBottom: 12,
        padding: 15,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
      },
      cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
      },
    });
  }, [theme]);

  // Reusable Modern Card Component (Defined inside to access styles)
  const DashboardCard = ({
    title,
    icon,
    onPress,
    accessibilityLabel,
  }: {
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
    accessibilityLabel: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint={`Navigates to ${title}`}
    >
      <View style={styles.cardContent}>
        <LinearGradient
          colors={
            [theme.colors.background, theme.colors.surface] as [string, string]
          }
          style={styles.iconContainer}
        >
          <MaterialCommunityIcons
            name={icon}
            size={40}
            color={theme.colors.primary}
          />
        </LinearGradient>
        <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Gradient Colors
  const gradientColors = [
    theme.colors.primary,
    theme.colors.secondary || "#2E7D32",
  ] as [string, string];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
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
        <Title style={styles.subtitleText}>Financial Overview</Title>
      </LinearGradient>

      {/* Cards Grid */}
      <View style={styles.cardsContainer}>
        <DashboardCard
          title="Work / Loan"
          icon="briefcase-variant-outline"
          onPress={() => navigation.navigate("WorkStack", { screen: "Work" })}
          accessibilityLabel="Work and Loan Management"
        />

        <DashboardCard
          title="Sale / Lending"
          icon="cash-register"
          onPress={() => navigation.navigate("SaleStack", { screen: "Sale" })}
          accessibilityLabel="Sale and Lending Management"
        />

        <DashboardCard
          title="Expense (اخراجات)"
          icon="wallet-outline"
          onPress={() =>
            navigation.navigate("ExpenseStack", { screen: "Expenses" })
          }
          accessibilityLabel="Expense Management"
        />

        <DashboardCard
          title="Manage User"
          icon="account-group-outline"
          onPress={() => navigation.navigate("UsersStack", { screen: "Users" })}
          accessibilityLabel="User Management"
        />

        <DashboardCard
          title="Admin"
          icon="shield-account-outline"
          onPress={() =>
            navigation.navigate("HomeStack", {
              screen: "AdminStack",
              params: { title: "Admin" },
            })
          }
          accessibilityLabel="Admin Settings"
        />

        <DashboardCard
          title="Dashboard"
          icon="view-dashboard-outline"
          onPress={() =>
            navigation.navigate("DashboardStack", {
              screen: "Dashboard",
              params: { title: "Dashboard" },
            })
          }
          accessibilityLabel="Analytics Dashboard"
        />

        <Notification />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
