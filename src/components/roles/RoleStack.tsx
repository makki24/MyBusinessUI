import CustomHeader from "../common/CustomHeader";
import RolesScreen from "../../../screens/RolesScreen";
import AddRoleScreen from "../../../screens/AddRoleScreen";
import EditRoleScreen from "../../../screens/EditRoleScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const RoleStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Roles" component={RolesScreen} />
      <Stack.Screen name="AddRole" component={AddRoleScreen} />
      <Stack.Screen name="EditRole" component={EditRoleScreen} />
    </Stack.Navigator>
  );
};

export default RoleStack;
