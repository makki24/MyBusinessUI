import CustomHeader from "../common/CustomHeader";
import ExpenseTypesScreen from "../../../screens/ExpenseTypesScreen";
import AddExpenseTypeScreen from "../../../screens/AddExpenseTypeScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const ExpenseTypeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="ExpenseTypes" component={ExpenseTypesScreen} />
      <Stack.Screen name="AddExpenseType" component={AddExpenseTypeScreen} />
    </Stack.Navigator>
  );
};

export default ExpenseTypeStack;
