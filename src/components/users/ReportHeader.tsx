import { ParamListBase, useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { User } from "../../../types";
import { BackHandler, View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import { HEADING_SIZE, UI_ELEMENTS_GAP } from "../../styles/constants";
import { IconButton, Text, useTheme } from "react-native-paper";
import ProfilePicture from "../common/ProfilePicture";
import DrawerToggler from "../header/DrawerToggler";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import customBackDrop from "../../../components/CustomBackDrop";
import UserSummary from "./UserSummary";

interface ReportHeaderProps {
  route: {
    params: {
      user: User;
    };
  };
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ route }) => {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const [user] = useState<User>(route.params.user);
  const [canGoBack, setCanGoBack] = useState<boolean>();
  const theme = useTheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "80%"], []);

  useEffect(() => {
    setCanGoBack(navigation.canGoBack());
  }, []);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else setCanGoBack(false);
  };

  const openBottomSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();

    const backAction = () => {
      bottomSheetModalRef.current.close();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const navigateToSummary = () => {
    openBottomSheet();
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
        <IconButton
          iconColor={theme.colors.primary}
          icon={"filter"}
          onPress={() => {
            navigateToSummary();
          }}
        />
      </View>
      <DrawerToggler />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={customBackDrop}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
      >
        <UserSummary
          userProp={user}
          close={() => bottomSheetModalRef.current.close()}
        />
      </BottomSheetModal>
    </View>
  );
};

export default ReportHeader;
