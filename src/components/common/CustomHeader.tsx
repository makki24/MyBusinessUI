import {
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { StyleSheet, View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import { HEADING_SIZE, UI_ELEMENTS_GAP } from "../../styles/constants";
import { IconButton, Text, useTheme } from "react-native-paper";
import React, { useEffect, useState } from "react";
import DrawerToggler from "../header/DrawerToggler";
import { apiUrl, appVariant } from "../../app-env.config";

interface RouteParams {
  title?: string;
}

const IS_PROD = false;

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
        <View>
          <Text style={{ fontSize: HEADING_SIZE }}>{title ?? route.name}</Text>
          {!IS_PROD && (
            <View
              style={[
                styles.envBadge,
                { backgroundColor: theme.colors.errorContainer },
              ]}
            >
              <Text
                style={[
                  styles.envText,
                  { color: theme.colors.onErrorContainer },
                ]}
                numberOfLines={1}
              >
                {appVariant} · {apiUrl}
              </Text>
            </View>
          )}
        </View>
      </View>
      <DrawerToggler />
    </View>
  );
};

const styles = StyleSheet.create({
  envBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
    alignSelf: "flex-start",
  },
  envText: {
    fontSize: 10,
    fontWeight: "600",
  },
});

export default CustomHeader;
