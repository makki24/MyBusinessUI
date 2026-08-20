import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, useTheme, Text, Avatar } from "react-native-paper";
import ProfilePicture from "../../common/ProfilePicture";
import { User } from "../../../../types";

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

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <TouchableOpacity style={styles.gridItem} onPress={() => onSelect(item.id)}>
      <View>
        {item.picture ? (
          <ProfilePicture
            size={56}
            picture={item.picture}
            style={{ marginBottom: 4 }}
          />
        ) : (
          <Avatar.Text
            size={56}
            label={getInitials(item.name)}
            style={{
              backgroundColor: theme.colors.primaryContainer,
              marginBottom: 4,
            }}
            color={theme.colors.onPrimaryContainer}
          />
        )}

        {selected && (
          <IconButton
            icon="check"
            size={16}
            iconColor={theme.colors.onPrimary}
            containerColor={theme.colors.primary}
            style={styles.checkIcon}
          />
        )}
      </View>
      <Text style={styles.gridText} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkIcon: {
    position: "absolute",
    top: -8,
    right: -8,
    margin: 0,
    width: 24,
    height: 24,
    zIndex: 1,
  },
  gridText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});

export default AttendanceUserItem;
