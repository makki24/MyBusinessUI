import CustomHeader from "../common/CustomHeader";
import HomeScreen from "../../../screens/HomeScreen";
import ImpersonationScreen from "../../../screens/ImpersonationScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AdminStack from "../admin/AdminStack";

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator id="HomeStack">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ header: () => <CustomHeader /> }}
      />
      <Stack.Screen
        name="AdminStack"
        component={AdminStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        options={{ header: () => <CustomHeader /> }}
        name="ImpersonationScreen"
        component={ImpersonationScreen}
      />
      <Stack.Screen
        options={{ header: () => <CustomHeader /> }}
        name="SettlementScreen"
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        component={require("../../../screens/SettlementScreen").default}
      />
      <Stack.Screen
        options={{ header: () => <CustomHeader /> }}
        name="AllActivityScreen"
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        component={require("../../../screens/AllActivityScreen").default}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
