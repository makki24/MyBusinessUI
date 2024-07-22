import CustomHeader from "../common/CustomHeader";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AddSender from "./AddSender";
import TagsSelector from "../tags/TagsSelector";
import AddReceiver from "./AddReceiver";
import AttendanceScreen from "../work/AttendanceScreen";
import WorkTypeList from "./WorkTypeList";
import WorkAndSale from "./WorkAndSale";
import WorkAndSaleList from "./WorkAndSaleList";
import AddWorkScreen from "../../../screens/AddWorkScreen";

const Stack = createStackNavigator();

const MiddleManStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name={"TagsSelector"} component={TagsSelector} />
      <Stack.Screen name="AddSender" component={AddSender} />
      <Stack.Screen name={"AddReceiver"} component={AddReceiver} />
      <Stack.Screen name="WorkTypeList" component={WorkTypeList} />
      <Stack.Screen name={"AttendanceScreen"} component={AttendanceScreen} />
      <Stack.Screen name={"WorkAndSale"} component={WorkAndSale} />
      <Stack.Screen name={"WorkAndSaleList"} component={WorkAndSaleList} />
      <Stack.Screen name="AddWork" component={AddWorkScreen} />
    </Stack.Navigator>
  );
};

export default MiddleManStack;
