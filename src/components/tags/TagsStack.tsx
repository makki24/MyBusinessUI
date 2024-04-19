import CustomHeader from "../common/CustomHeader";
import TagsScreen from "../../../screens/TagsScreen";
import AddTagScreen from "../../../screens/AddTagScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const TagsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="ManageTags" component={TagsScreen} />
      <Stack.Screen name="AddTag" component={AddTagScreen} />
    </Stack.Navigator>
  );
};

export default TagsStack;
