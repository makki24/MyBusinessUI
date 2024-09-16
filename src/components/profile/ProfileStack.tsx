import CustomHeader from "../common/CustomHeader";
import AddLoanClearTransaction from "../../../screens/AddLoanClearTransaction";
import LoanTransactionScreen from "../../../screens/LoanTransactionsScreen";
import ContributionScreen from "../../../screens/ContributionScreen";
import AddContributionScreen from "../../../screens/AddContributionScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TagsSelector from "../tags/TagsSelector";

const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen
        name="ManageAmounts"
        component={AddLoanClearTransaction}
        options={{ title: "Title", headerTitle: "title" }}
      />
      <Stack.Screen
        name="LoanTransactionList"
        component={LoanTransactionScreen}
      />
      <Stack.Screen name="ContributionScreen" component={ContributionScreen} />
      <Stack.Screen name="AddContribution" component={AddContributionScreen} />
      <Stack.Screen name={"TagsSelector"} component={TagsSelector} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
