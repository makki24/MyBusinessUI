import CustomHeader from "../common/CustomHeader";
import HomeScreen from "../../../screens/HomeScreen";
import AdminScreen from "../../../screens/AdminScreen";
import ImpersonationScreen from "../../../screens/ImpersonationScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AdminScreen" component={AdminScreen} />
      <Stack.Screen
        name="ImpersonationScreen"
        component={ImpersonationScreen}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
