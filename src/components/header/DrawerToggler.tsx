import { TouchableOpacity } from "react-native";
import { HEADING_SIZE } from "../../styles/constants";
import React from "react";
import ProfilePicture from "../common/ProfilePicture";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useRecoilValue } from "recoil";
import { userState } from "../../../recoil/atom";

const DrawerToggler = () => {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const userInfo = useRecoilValue(userState);

  return (
    <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
      <ProfilePicture
        style={{
          width: HEADING_SIZE * 2,
          height: HEADING_SIZE * 2,
          borderRadius: HEADING_SIZE,
        }}
        size={HEADING_SIZE * 2}
        picture={userInfo?.picture}
      />
    </TouchableOpacity>
  );
};

export default DrawerToggler;
