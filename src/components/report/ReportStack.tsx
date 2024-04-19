import CustomHeader from "../common/CustomHeader";
import ReportScreen from "../../../screens/ReportScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const ReportStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Report" component={ReportScreen} />
    </Stack.Navigator>
  );
};

export default ReportStack;
