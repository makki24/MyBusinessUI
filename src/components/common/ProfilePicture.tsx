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
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!picture) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, [picture]);

  if (hasError || !picture) {
    return <Avatar.Icon size={size} icon="account" style={style} />;
  }

  return (
    <Avatar.Image
      size={size}
      source={{ uri: picture }}
      style={style}
      onError={() => setHasError(true)}
    />
  );
};

export default ProfilePicture;
