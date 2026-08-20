import CustomHeader from "../common/CustomHeader";
import ExpenseScreen from "../../../screens/ExpenseScreen";
import AddExpenseScreen from "../../../screens/AddExpenseScreen";
import ExpenseSelectionScreen from "../../../screens/ExpenseSelectionScreen";
import ExpenseTypeReportScreen from "../../../screens/ExpenseTypeReportScreen";
import UserReportScreen from "../../../screens/UserReportScreen";
import UserSummary from "../users/UserSummary";
import ReportHeader from "../users/ReportHeader";
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
      <Stack.Screen
        name="ExpenseSelection"
        component={ExpenseSelectionScreen}
      />
      <Stack.Screen
        name="ExpenseTypeReport"
        component={ExpenseTypeReportScreen}
      />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen
        name="UserReport"
        options={{
          header: (props) => <ReportHeader {...props} summary={true} />,
        }}
        component={UserReportScreen}
      />
      <Stack.Screen
        name={"UserSummary"}
        options={{
          header: (props) => <ReportHeader {...props} summary={false} />,
        }}
        component={UserSummary}
      />
    </Stack.Navigator>
  );
};

export default ExpenseStack;
