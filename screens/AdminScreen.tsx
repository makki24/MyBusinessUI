import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { Card, Title } from "react-native-paper";
import homeScreenStyles from "../src/styles/homeScreenStyles";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useRecoilState } from "recoil";
import { userState } from "../recoil/atom";

type AdminScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const AdminScreen: React.FC<AdminScreenProps> = ({ navigation }) => {
  const [loggedInUser] = useRecoilState(userState);
  const [impersonate, setImpersonate] = useState<boolean>(false);

  useEffect(() => {
    setImpersonate(loggedInUser.roles.some((role) => role.name === "ADMIN"));
  }, []);

  return (
    <ScrollView contentContainerStyle={homeScreenStyles.container}>
      {/* Two Cards in One Row */}
      <View style={homeScreenStyles.cardsContainer}>
        <Card
          style={homeScreenStyles.card}
          onPress={() => navigation.navigate("RolesStack", { screen: "Roles" })}
        >
          <Card.Cover source={require("../assets/roles.png")} />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Manage Roles</Title>
          </View>
          <Card.Content>
            <Text>Hello</Text>
          </Card.Content>
        </Card>

        <View style={homeScreenStyles.gap} />

        <Card
          style={homeScreenStyles.card}
          onPress={() =>
            navigation.navigate("ExpenseTypeStack", {
              screen: "ExpenseTypes",
              params: { title: "Expense types" },
            })
          }
        >
          <Card.Cover source={require("../assets/expense_types.jpeg")} />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Expense Types</Title>
          </View>
        </Card>

        <Card
          style={homeScreenStyles.card}
          onPress={() => navigation.navigate("TagsStack", { screen: "Tags" })}
        >
          <Card.Cover source={require("../assets/tags.jpeg")} />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Manage Tags</Title>
          </View>
        </Card>

        <Card
          style={homeScreenStyles.card}
          onPress={() =>
            navigation.navigate("WorkStack", {
              screen: "WorkType",
              params: { title: "Work type" },
            })
          }
        >
          <Card.Cover source={require("../assets/work_type.jpeg")} />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Manage Work Type</Title>
          </View>
        </Card>

        {impersonate && (
          <Card
            style={homeScreenStyles.card}
            onPress={() =>
              navigation.navigate("HomeStack", {
                screen: "ImpersonationScreen",
                params: { title: "Impersonatione user" },
              })
            }
          >
            <Card.Cover source={require("../assets/work_type.jpeg")} />
            <View style={homeScreenStyles.textOverlay}>
              <Title style={homeScreenStyles.cardTitle}>Impersonate</Title>
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

export default AdminScreen;
