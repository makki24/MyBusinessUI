import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ModernDashboardScreen from "./ModernDashboardScreen";
import LineChartScreen from "./LineChartScreen";
import SummaryByType from "./SummaryByType";
import CustomHeader from "../common/CustomHeader";

const Stack = createStackNavigator();

const DashboardStack = () => {
  return (
    <Stack.Navigator
      id="DashboardStack"
      screenOptions={{ header: () => <CustomHeader /> }}
    >
      <Stack.Screen name="Dashboard" component={ModernDashboardScreen} />
      <Stack.Screen name="LineChart" component={LineChartScreen} />
      <Stack.Screen name="SummaryByType" component={SummaryByType} />
    </Stack.Navigator>
  );
};

export default DashboardStack;
