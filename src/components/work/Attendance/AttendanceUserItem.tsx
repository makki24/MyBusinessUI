import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, useTheme, Text } from "react-native-paper";
import ProfilePicture from "../../common/ProfilePicture";
import { User } from "../../../../types";
import {
  ATTENDANCE_USER_RADIUS,
  UI_ELEMENTS_GAP,
} from "../../../styles/constants";

interface AttendanceUserItemProps {
  item: User;
  onSelect: (id: string) => void;
  selectedUsersState: [string[], Dispatch<SetStateAction<string[]>>];
}

const AttendanceUserItem: React.FC<AttendanceUserItemProps> = ({
  item,
  onSelect,
  selectedUsersState,
}) => {
  const [selected, setSelected] = useState<boolean>(false);
  const [selectedUsers] = selectedUsersState;
  const theme = useTheme();

  useEffect(() => {
    setSelected(selectedUsers.some((user) => user === item.id));
  }, [selectedUsers]);

  return (
    <TouchableOpacity
      style={{
        ...styles.userCard,
        backgroundColor: theme.colors.surfaceVariant,
      }}
      onPress={() => {
        onSelect(item.id);
      }}
    >
      {selected && (
        <View style={styles.icon}>
          <IconButton
            mode={"contained"}
            containerColor={theme.colors.primary}
            iconColor={theme.colors.onPrimary}
            icon="account-check"
            size={24}
          />
        </View>
      )}
      <ProfilePicture
        size={100}
        style={styles.userImage}
        picture={item.picture}
      />
      <Text style={styles.userName}>{item.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  userCard: {
    flex: 1,
    margin: UI_ELEMENTS_GAP,
    padding: UI_ELEMENTS_GAP,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    position: "relative", // Add this
  },
  icon: {
    position: "absolute", // Change this
    top: 0, // Add this
    right: 0, // Add this
    zIndex: 1, // Add this
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: ATTENDANCE_USER_RADIUS,
  },
  userName: {
    marginTop: UI_ELEMENTS_GAP,
  },
});

export default AttendanceUserItem;
