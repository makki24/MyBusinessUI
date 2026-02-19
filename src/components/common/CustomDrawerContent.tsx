import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { User } from "../../../types";
import React from "react";
import { useRecoilState } from "recoil";
import { userState } from "../../../recoil/atom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity, View } from "react-native";
import {
  CONTAINER_PADDING,
  DRAWER_CONTENT_MARGIN,
  MAIN_PROFILE_PIC,
} from "../../styles/constants";
import {
  Avatar,
  Caption,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { DEFAULT_AVATAR_URL } from "../../../constants/mybusiness.constants";

interface CustomDrawerContentProps extends DrawerContentComponentProps {
  userInfo: User;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = ({
  navigation,
  state,
  descriptors,
  ...props
}) => {
  const theme = useTheme();
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
      {/* User Profile Section */}
      <View
        style={{
          padding: DRAWER_CONTENT_MARGIN,
          paddingBottom: CONTAINER_PADDING,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outlineVariant,
        }}
      >
        {/* Avatar Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
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

        {/* Username on new line */}
        <Text
          variant="titleMedium"
          style={{
            marginTop: 8,
            color: theme.colors.onSurface,
            flexShrink: 1,
          }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {userInfo?.name}
        </Text>
        {userInfo?.phoneNumber && (
          <Caption style={{ color: theme.colors.onSurfaceVariant }}>
            {userInfo.phoneNumber}
          </Caption>
        )}
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
            borderTopColor: theme.colors.outlineVariant,
          }}
        >
          <Text style={{ color: theme.colors.onSurface }}>Logout</Text>
        </View>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
