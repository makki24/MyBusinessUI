import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AdminScreen from "../../../screens/AdminScreen";
import CustomHeader from "../common/CustomHeader";
import WorkTypeScreen from "./WorkTypeScreen";
import AddWorkTypeScreen from "../../../screens/AddWorkTypeScreen";
import TagsSelector from "../tags/TagsSelector";

const Stack = createStackNavigator();

const AdminStack = () => {
  return (
    <Stack.Navigator
      id="AdminStack"
      screenOptions={{ header: () => <CustomHeader /> }}
    >
      <Stack.Screen name="AdminScreen" component={AdminScreen} />
      <Stack.Screen name="WorkTypeList" component={WorkTypeScreen} />
      <Stack.Screen name="AddWorkType" component={AddWorkTypeScreen} />
      <Stack.Screen name={"TagsSelector"} component={TagsSelector} />
    </Stack.Navigator>
  );
};

export default AdminStack;
