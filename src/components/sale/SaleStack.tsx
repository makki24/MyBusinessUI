import CustomHeader from "../common/CustomHeader";
import SaleScreen from "../../../screens/SalesScreen";
import AddSaleScreen from "../../../screens/AddSaleScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const SaleStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Sale" component={SaleScreen} />
      <Stack.Screen name="AddSale" component={AddSaleScreen} />
    </Stack.Navigator>
  );
};

export default SaleStack;
