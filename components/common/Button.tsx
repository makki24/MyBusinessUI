// Button.tsx
import React from "react";
import { Button as PaperButton } from "react-native-paper";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  mode?: "text" | "outlined" | "contained" | "elevated" | "contained-tonal";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  icon,
  disabled,
  mode = "contained",
  style,
}) => {
  return (
    <PaperButton
      uppercase={false}
      style={style}
      icon={icon}
      mode={mode}
      onPress={onPress}
      disabled={disabled}
    >
      {title}
    </PaperButton>
  );
};

export default Button;
