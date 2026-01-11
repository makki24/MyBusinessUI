import React, { useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Title } from "react-native-paper";
import homeScreenStyles from "../src/styles/homeScreenStyles";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import Notification from "../src/notifications/Notification";
import * as Notifications from "expo-notifications";
import { useLinkTo } from "@react-navigation/native";
import * as Linking from "expo-linking";
import crashlytics from "@react-native-firebase/crashlytics";
import { PushNotificationTrigger } from "expo-notifications/src/Notifications.types";
import { LinearGradient } from "expo-linear-gradient";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PRIMARY, SECONDARY } from "../src/styles/colors";

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

// Reusable Modern Card Component
const DashboardCard = ({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={homeScreenStyles.cardContainer}>
    <View style={homeScreenStyles.cardContent}>
      <LinearGradient
        colors={["#F5F5F5", "#FFFFFF"]}
        style={homeScreenStyles.iconContainer}
      >
        <MaterialCommunityIcons name={icon} size={40} color={PRIMARY} />
      </LinearGradient>
      <Text style={homeScreenStyles.cardTitle}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const linkTo = useLinkTo();

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
  }, []); // Empty dependency array

  return (
    <ScrollView
      contentContainerStyle={homeScreenStyles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <LinearGradient
        colors={[PRIMARY, SECONDARY]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={homeScreenStyles.headerGradient}
      >
        <Title style={homeScreenStyles.welcomeText}>MyBusiness</Title>
        <Title style={homeScreenStyles.subtitleText}>
          Financial Management
        </Title>
      </LinearGradient>

      {/* Cards Grid */}
      <View style={homeScreenStyles.cardsContainer}>
        <DashboardCard
          title="Work / Loan"
          icon="briefcase-variant-outline"
          onPress={() => navigation.navigate("WorkStack", { screen: "Work" })}
        />

        <DashboardCard
          title="Sale / Lending"
          icon="cash-register"
          onPress={() => navigation.navigate("SaleStack", { screen: "Sale" })}
        />

        <DashboardCard
          title="Expense (اخراجات)"
          icon="wallet-outline"
          onPress={() =>
            navigation.navigate("ExpenseStack", { screen: "Expenses" })
          }
        />

        <DashboardCard
          title="Manage User"
          icon="account-group-outline"
          onPress={() => navigation.navigate("UsersStack", { screen: "Users" })}
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
        />

        <Notification />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
