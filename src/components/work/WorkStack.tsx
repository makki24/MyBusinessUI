import CustomHeader from "../common/CustomHeader";
import WorksScreen from "../../../screens/WorksScreen";
import AddWorkScreen from "../../../screens/AddWorkScreen";
import WorkTypeScreen from "../../../screens/WorkTypeScreen";
import AddWorkTypeScreen from "../../../screens/AddWorkTypeScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AttendanceScreen from "./AttendanceScreen";
import AttendanceConfirmation from "./AttendanceConfirmation";
import TagsSelector from "../tags/TagsSelector";

const Stack = createStackNavigator();

const WorkStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Work" component={WorksScreen} />
      <Stack.Screen name="AddWork" component={AddWorkScreen} />
      <Stack.Screen name="WorkType" component={WorkTypeScreen} />
      <Stack.Screen name="AddWorkType" component={AddWorkTypeScreen} />
      <Stack.Screen name={"AttendanceScreen"} component={AttendanceScreen} />
      <Stack.Screen
        name={"AttendanceConfirmation"}
        component={AttendanceConfirmation}
      />
      <Stack.Screen name={"TagsSelector"} component={TagsSelector} />
    </Stack.Navigator>
  );
};

export default WorkStack;
