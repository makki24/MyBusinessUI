import CustomHeader from "../common/CustomHeader";
import ExpenseScreen from "../../../screens/ExpenseScreen";
import AddExpenseScreen from "../../../screens/AddExpenseScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const ExpenseStack = () => {
  return (
    <Stack.Navigator
      id="ExpenseStack"
      screenOptions={{ header: () => <CustomHeader /> }}
    >
      <Stack.Screen name="Expenses" component={ExpenseScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
    </Stack.Navigator>
  );
};

export default ExpenseStack;
