// src/components/UserDetails.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Avatar, Text } from "react-native-paper";
import { DEFAULT_AVATAR_URL } from "../../constants/mybusiness.constants";
import { User } from "../../types";
import { HEADING_SIZE, UI_ELEMENTS_GAP } from "../../src/styles/constants";

interface UserDetailsProps {
  user: User;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
  const [imageExists, setImageExists] = useState(true);

  const checkImageExists = async () => {
    try {
      if (!user.picture || user.picture === "") throw new Error("No image");
      const response = await fetch(user.picture);
      setImageExists(response.ok);
    } catch (error) {
      setImageExists(false);
    }
  };

  useEffect(() => {
    checkImageExists();
  }, []); // Call when the component mounts

  return (
    <View style={styles.userContainer}>
      <Avatar.Image
        size={HEADING_SIZE * 2}
        source={{
          uri: imageExists && user.picture ? user.picture : DEFAULT_AVATAR_URL,
        }}
        style={styles.avatar}
      />
      <Text variant="titleMedium">{user.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: UI_ELEMENTS_GAP,
  },
  username: {
    fontWeight: "bold",
  },
});

export default UserDetails;
