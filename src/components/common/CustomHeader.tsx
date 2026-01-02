import {
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import { HEADING_SIZE, UI_ELEMENTS_GAP } from "../../styles/constants";
import { IconButton, Text, useTheme } from "react-native-paper";
import React, { useEffect, useState } from "react";
import DrawerToggler from "../header/DrawerToggler";

interface RouteParams {
  title?: string;
}

const CustomHeader = () => {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const title = route.params?.title || route.name;
  const [canGoBack, setCanGoBack] = useState<boolean>();
  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else setCanGoBack(false);
  };

  useEffect(() => {
    setCanGoBack(navigation.canGoBack());
  }, []);

  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        ...commonStyles.row,
        alignItems: "center",
        padding: UI_ELEMENTS_GAP,
        paddingTop: insets.top,
        paddingBottom: 0,
        backgroundColor: theme.colors.background,
      }}
    >
      <View style={commonStyles.simpleRow}>
        {canGoBack ? (
          <IconButton
            icon="arrow-left"
            size={HEADING_SIZE}
            onPress={() => goBack()}
          />
        ) : null}
        <Text style={{ fontSize: HEADING_SIZE }}>{title ?? route.name}</Text>
      </View>
      <DrawerToggler />
    </View>
  );
};

export default CustomHeader;
