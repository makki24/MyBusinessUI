import type {
  DrawerDescriptorMap,
  DrawerNavigationHelpers,
} from "@react-navigation/drawer/src/types";
import { DrawerNavigationState, ParamListBase } from "@react-navigation/native";
import { User } from "../../../types";
import React from "react";
import { useRecoilState } from "recoil";
import { userState } from "../../../recoil/atom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { TouchableOpacity, View } from "react-native";
import {
  CONTAINER_PADDING,
  DRAWER_CONTENT_MARGIN,
  MAIN_PROFILE_PIC,
} from "../../styles/constants";
import { Avatar, Caption, IconButton, Text } from "react-native-paper";
import { DEFAULT_AVATAR_URL } from "../../../constants/mybusiness.constants";

interface CustomDrawerContentProps {
  navigation: DrawerNavigationHelpers;
  state: DrawerNavigationState<ParamListBase>; // Adjust this type based on your navigation stack
  descriptors: DrawerDescriptorMap;
  userInfo: User;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = ({
  navigation,
  state,
  descriptors,
  ...props
}) => {
  const userInfo = props.userInfo as User;
  const [_, setUserInfo] = useRecoilState(userState);

  const toggleDrawer = () => {
    navigation.toggleDrawer();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("@token");
    setUserInfo(null);
  };

  const navigateToManageAmounts = () => {
    navigation.navigate("ProfileStack", {
      screen: "LoanTransactionList",
      params: { title: "Loan Clear Transactions" },
    });
  };

  const navigateToContributionScreen = () => {
    navigation.navigate("ProfileStack", {
      screen: "ContributionScreen",
      params: { title: "My Contributions" },
    });
  };

  const navigateToEditAccount = () => {
    navigation.navigate("UsersStack", {
      screen: "AddUser",
      params: {
        title: `Edit User: ${userInfo.name}`,
        user: userInfo,
        isEditMode: true,
      },
    });
  };

  return (
    <DrawerContentScrollView {...props}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginLeft: DRAWER_CONTENT_MARGIN,
        }}
      >
        <TouchableOpacity onPress={toggleDrawer}>
          <Avatar.Image
            source={{ uri: userInfo?.picture || DEFAULT_AVATAR_URL }}
            size={MAIN_PROFILE_PIC}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToEditAccount}>
          <IconButton icon="account-edit" size={MAIN_PROFILE_PIC / 2} />
        </TouchableOpacity>

        <View
          style={{ marginLeft: "auto", marginRight: DRAWER_CONTENT_MARGIN }}
        >
          <TouchableOpacity onPress={navigateToContributionScreen}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton icon="wallet" style={{ margin: 0, padding: 0 }} />
              <Caption>{userInfo?.amountHolding}</Caption>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToManageAmounts}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton
                icon="hand-extended"
                style={{ margin: 0, padding: 0 }}
              />
              <Caption>{userInfo?.amountToReceive}</Caption>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <DrawerItemList
        state={state}
        descriptors={descriptors}
        navigation={navigation}
        {...props}
      />
      <TouchableOpacity onPress={handleLogout}>
        <View
          style={{
            padding: CONTAINER_PADDING,
            borderTopWidth: 1,
            borderTopColor: "#ccc",
          }}
        >
          <Text>Logout</Text>
        </View>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
