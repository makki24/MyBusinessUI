import { ParamListBase, useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import React, { useEffect, useState } from "react";
import { User } from "../../../types";
import { View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import { HEADING_SIZE, UI_ELEMENTS_GAP } from "../../styles/constants";
import { IconButton, Text, useTheme } from "react-native-paper";
import ProfilePicture from "../common/ProfilePicture";
import DrawerToggler from "../header/DrawerToggler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "../common/CustomHeader";

interface ReportHeaderProps {
  route: {
    params?: {
      user?: User;
    };
  };
  summary: boolean;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ route, summary }) => {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const userParam = route?.params?.user;

  // Guard clause: If no user is passed, fallback to standard header
  if (!userParam) {
    return <CustomHeader />;
  }

  const [user] = useState<User>(userParam);
  const [canGoBack, setCanGoBack] = useState<boolean>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setCanGoBack(navigation.canGoBack());
  }, []);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else setCanGoBack(false);
  };

  const navigateToSummary = () => {
    navigation.navigate("UsersStack", {
      screen: "UserSummary",
      params: { title: "Summary", user },
    });
  };

  return (
    <View
      style={{
        ...commonStyles.row,
        alignItems: "center",
        padding: UI_ELEMENTS_GAP,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
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
        <ProfilePicture
          style={{ marginRight: UI_ELEMENTS_GAP }}
          size={40}
          picture={user.picture}
        />
        <View>
          <Text>{user.name}</Text>
          <Text>{user.phoneNumber}</Text>
        </View>
        {summary && (
          <IconButton
            iconColor={theme.colors.primary}
            icon={"menu"}
            onPress={() => {
              navigateToSummary();
            }}
          />
        )}
      </View>
      <DrawerToggler />
    </View>
  );
};

export default ReportHeader;
