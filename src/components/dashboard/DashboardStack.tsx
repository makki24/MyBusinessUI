import CustomHeader from "../common/CustomHeader";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "./DashboardScreen";
import TagsSelector from "../tags/TagsSelector";

const Stack = createStackNavigator();

const DashboardStack = () => {
  return (
    <Stack.Navigator
      id="DashboardStack"
      screenOptions={{ header: () => <CustomHeader /> }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name={"TagsSelector"} component={TagsSelector} />
    </Stack.Navigator>
  );
};

export default DashboardStack;
