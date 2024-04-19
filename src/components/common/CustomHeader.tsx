import {
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useRecoilValue } from "recoil";
import { userState } from "../../../recoil/atom";
import { Image, TouchableOpacity, View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import { HEADING_SIZE, UI_ELEMENTS_GAP } from "../../styles/constants";
import { IconButton, Text } from "react-native-paper";
import { DEFAULT_AVATAR_URL } from "../../../constants/mybusiness.constants";
import React from "react";

interface RouteParams {
  title?: string;
}

const CustomHeader = () => {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const userInfo = useRecoilValue(userState);
  const title = route.params?.title || route.name;
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View
      style={{
        ...commonStyles.row,
        alignItems: "center",
        padding: UI_ELEMENTS_GAP,
        paddingBottom: 0,
      }}
    >
      <View style={commonStyles.simpleRow}>
        {navigation.canGoBack() ? (
          <IconButton
            icon="arrow-left"
            size={HEADING_SIZE}
            onPress={() => goBack()}
          />
        ) : null}
        <Text style={{ fontSize: HEADING_SIZE }}>{title ?? route.name}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <Image
          source={{ uri: userInfo?.picture || DEFAULT_AVATAR_URL }}
          style={{
            width: HEADING_SIZE * 2,
            height: HEADING_SIZE * 2,
            borderRadius: HEADING_SIZE,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeader;
