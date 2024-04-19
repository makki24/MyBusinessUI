import CustomHeader from "../common/CustomHeader";
import TagsScreen from "../../../screens/TagsScreen";
import AddTagScreen from "../../../screens/AddTagScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TagsSelector from "./TagsSelector";

const Stack = createStackNavigator();

const TagsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="ManageTags" component={TagsScreen} />
      <Stack.Screen name="AddTag" component={AddTagScreen} />
      <Stack.Screen name={"TagsSelector"} component={TagsSelector} />
    </Stack.Navigator>
  );
};

export default TagsStack;
