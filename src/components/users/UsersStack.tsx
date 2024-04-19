import CustomHeader from "../common/CustomHeader";
import UsersScreen from "../../../screens/UsersScreen";
import AddUserScreen from "../../../screens/AddUserScreen";
import UserReportScreen from "../../../screens/UserReportScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const UsersStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Users" component={UsersScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="UserReport" component={UserReportScreen} />
    </Stack.Navigator>
  );
};

export default UsersStack;
