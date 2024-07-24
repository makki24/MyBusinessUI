import CustomHeader from "../common/CustomHeader";
import ReportScreen from "../../../screens/ReportScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Calculator from "./Calculator";

const Stack = createStackNavigator();

const ReportStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Report" component={ReportScreen} />
      <Stack.Screen name="Calculator" component={Calculator} />
    </Stack.Navigator>
  );
};

export default ReportStack;
