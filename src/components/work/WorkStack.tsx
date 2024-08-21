import CustomHeader from "../common/CustomHeader";
import WorksScreen from "../../../screens/WorksScreen";
import AddWorkScreen from "../../../screens/AddWorkScreen";
import WorkTypeScreen from "../../../screens/WorkTypeScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AttendanceScreen from "./Attendance/AttendanceScreen";
import AttendanceConfirmation from "./Attendance/AttendanceConfirmation";
import TagsSelector from "../tags/TagsSelector";
import WorkersList from "./BatchEdit/WorkersList";
import UserWorksList from "./BatchEdit/UserWorksList";
import WorkTypeSelectorList from "./AddWork/WorkTypeSelectorList";

const Stack = createStackNavigator();

const WorkStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Work" component={WorksScreen} />
      <Stack.Screen name="AddWork" component={AddWorkScreen} />
      <Stack.Screen name="WorkType" component={WorkTypeScreen} />
      <Stack.Screen name={"AttendanceScreen"} component={AttendanceScreen} />
      <Stack.Screen
        name={"AttendanceConfirmation"}
        component={AttendanceConfirmation}
      />
      <Stack.Screen name={"TagsSelector"} component={TagsSelector} />
      <Stack.Screen name={"WorkersList"} component={WorkersList} />
      <Stack.Screen name={"UserWorksList"} component={UserWorksList} />
      <Stack.Screen
        name="WorkTypeSelectorList"
        component={WorkTypeSelectorList}
      />
    </Stack.Navigator>
  );
};

export default WorkStack;
