import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { Card, Title } from "react-native-paper";
import homeScreenStyles from "../src/styles/homeScreenStyles";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

type AdminScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const AdminScreen: React.FC<AdminScreenProps> = ({ navigation }) => {
  const images = [
    { uri: "https://via.placeholder.com/300/FF5733/FFFFFF", interval: 3000 },
    { uri: "https://via.placeholder.com/300/33FF57/FFFFFF", interval: 7000 },
    { uri: "https://via.placeholder.com/300/5733FF/FFFFFF", interval: 4000 },
    { uri: "https://via.placeholder.com/300/FF33FF/FFFFFF", interval: 6000 }, // New Expense Card Image
    // Add more image URLs with different intervals as needed
  ];

  const [_, setCurrentImageIndex] = useState(Array(images.length).fill(0));

  useEffect(() => {
    const intervals = images.map((image, i) =>
      setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex.map((index, j) =>
            i === j ? (index === images.length - 1 ? 0 : index + 1) : index,
          ),
        );
      }, image.interval),
    );

    return () => intervals.forEach(clearInterval);
  }, []); // Empty dependency array

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
            navigation.navigate("ExpenseTypeStack", { screen: "ExpenseTypes" })
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
            navigation.navigate("WorkStack", { screen: "WorkType" })
          }
        >
          <Card.Cover source={require("../assets/work_type.jpeg")} />
          <View style={homeScreenStyles.textOverlay}>
            <Title style={homeScreenStyles.cardTitle}>Manage Work Type</Title>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

export default AdminScreen;
