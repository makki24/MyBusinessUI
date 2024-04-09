import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { Card, Title } from "react-native-paper";
import homeScreenStyles from "../src/styles/homeScreenStyles";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import Notification from "../src/notifications/Notification";
import * as Notifications from "expo-notifications";
import { useLinkTo } from '@react-navigation/native';
import * as Linking from "expo-linking";
import { RecoilLoadable } from "recoil";
import crashlytics from '@react-native-firebase/crashlytics';
import { useLastNotificationResponse } from "expo-notifications";

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const linkTo = useLinkTo();

  const lastNotificationResponse = useLastNotificationResponse();

  useEffect(() => {
    if (lastNotificationResponse) {
      console.log("lastNotificationResponse", lastNotificationResponse)
      let data = lastNotificationResponse?.notification?.request?.content?.data;

      if (data) {
        //code
      }
    }
  }, [lastNotificationResponse]);


  useEffect(() => {
    let isMounted = true;


    Notifications.getLastNotificationResponseAsync().then((response) => {
      console.log("home", response)
      if (!isMounted || !response?.notification) {
        return;
      }
      if (!response) return;
      const scheme = Linking.createURL('');
      const url = response.notification.request.content.data.url.split(scheme)[1];
      linkTo(`/${url}`);
    })
      .catch(error => {
        crashlytics().recordError(error);
      })

    return () => {
      isMounted = false;
    }
  }, []); // Empty dependency array

  return (
    <ScrollView contentContainerStyle={homeScreenStyles.container}>
      {/* Two Cards in One Row */}
      <View style={homeScreenStyles.cardsContainer}>
        <Card
          style={homeScreenStyles.card}
          onPress={() => navigation.navigate("WorkStack", { screen: "Work" })}
        >
          <Card.Cover source={require("../assets/work.jpeg")} />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Work / Loan</Title>
          </View>
        </Card>

        <View style={homeScreenStyles.gap} />

        <Card
          style={homeScreenStyles.card}
          onPress={() => navigation.navigate("SaleStack", { screen: "Sale" })}
        >
          <Card.Cover source={require("../assets/sale.jpeg")} />
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
          <Card.Cover source={require("../assets/expense.jpeg")} />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Expense (اخراجات)</Title>
          </View>
        </Card>
        <View style={homeScreenStyles.gap} />

        <Card
          style={homeScreenStyles.card}
          onPress={() => navigation.navigate("UsersStack", { screen: "Users" })}
        >
          <Card.Cover source={require("../assets/user.jpeg")} />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Manage User</Title>
          </View>
        </Card>

        {/* Admin Card */}
        <Card
          style={homeScreenStyles.card}
          onPress={() =>
            navigation.navigate("HomeStack", {
              screen: "AdminScreen",
              params: { title: "Admin" },
            })
          }
        >
          <Card.Cover source={require("../assets/admin.jpeg")} />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Admin</Title>
          </View>
        </Card>

        <View style={homeScreenStyles.gap} />

        <Notification />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
