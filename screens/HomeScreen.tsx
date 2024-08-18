import React, { useEffect } from "react";
import { View, ScrollView } from "react-native";
import { Card, Title } from "react-native-paper";
import homeScreenStyles from "../src/styles/homeScreenStyles";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import Notification from "../src/notifications/Notification";
import * as Notifications from "expo-notifications";
import { useLinkTo } from "@react-navigation/native";
import * as Linking from "expo-linking";
import crashlytics from "@react-native-firebase/crashlytics";
import { PushNotificationTrigger } from "expo-notifications/src/Notifications.types";

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

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
    <ScrollView contentContainerStyle={homeScreenStyles.container}>
      {/* Two Cards in One Row */}
      <View style={homeScreenStyles.cardsContainer}>
        <Card
          style={homeScreenStyles.card}
          onPress={() => navigation.navigate("WorkStack", { screen: "Work" })}
        >
          <Card.Cover
            style={homeScreenStyles.cardCover}
            source={require("../assets/work.jpeg")}
          />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Work / Loan</Title>
          </View>
        </Card>

        <View style={homeScreenStyles.gap} />

        <Card
          style={homeScreenStyles.card}
          onPress={() => navigation.navigate("SaleStack", { screen: "Sale" })}
        >
          <Card.Cover
            style={homeScreenStyles.cardCover}
            source={require("../assets/sale.jpeg")}
          />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Sale / Lending</Title>
          </View>
        </Card>

        <Card
          style={homeScreenStyles.card}
          onPress={() =>
            navigation.navigate("ExpenseStack", { screen: "Expenses" })
          }
        >
          <Card.Cover
            style={homeScreenStyles.cardCover}
            source={require("../assets/expense.jpeg")}
          />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Expense (اخراجات)</Title>
          </View>
        </Card>
        <View style={homeScreenStyles.gap} />

        <Card
          style={homeScreenStyles.card}
          onPress={() => navigation.navigate("UsersStack", { screen: "Users" })}
        >
          <Card.Cover
            style={homeScreenStyles.cardCover}
            source={require("../assets/user.jpeg")}
          />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Manage User</Title>
          </View>
        </Card>

        {/* Admin Card */}
        <Card
          style={homeScreenStyles.card}
          onPress={() =>
            navigation.navigate("HomeStack", {
              screen: "AdminStack",
              params: { title: "Admin" },
            })
          }
        >
          <Card.Cover
            style={homeScreenStyles.cardCover}
            source={require("../assets/admin.jpeg")}
          />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Admin</Title>
          </View>
        </Card>

        <View style={homeScreenStyles.gap} />

        {/* Admin Card */}
        <Card
          style={homeScreenStyles.card}
          onPress={() =>
            navigation.navigate("DashboardStack", {
              screen: "Dashboard",
              params: { title: "Dashboard" },
            })
          }
        >
          <Card.Cover
            style={homeScreenStyles.cardCover}
            source={require("../assets/charts.jpeg")}
          />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Dashboard</Title>
          </View>
        </Card>

        <Notification />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
