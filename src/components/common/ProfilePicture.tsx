import { DEFAULT_AVATAR_URL } from "../../../constants/mybusiness.constants";
import { Avatar } from "react-native-paper";
import React, { useEffect, useState } from "react";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { ImageStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

interface ProfilePictureProps {
  style: StyleProp<ImageStyle> | undefined;
  picture: string;
  size?: number;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  style,
  picture,
  size,
}) => {
  const [pictureUrl, setPictureUrl] = useState("");

  const checkImageExists = async () => {
    try {
      if (!picture || picture === "") throw new Error("No image");
      await fetch(picture);
      setPictureUrl(picture);
    } catch (error) {
      setPictureUrl(DEFAULT_AVATAR_URL);
    }
  };

  useEffect(() => {
    checkImageExists();
  }, []);

  return (
    <>
      {pictureUrl && (
        <Avatar.Image size={size} source={{ uri: pictureUrl }} style={style} />
      )}
    </>
  );
};

export default ProfilePicture;
