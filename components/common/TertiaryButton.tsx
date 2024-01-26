// Button.tsx
import React from 'react';
import {Button as PaperButton, useTheme} from "react-native-paper";
import {StyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import {ViewStyle} from "react-native/Libraries/StyleSheet/StyleSheetTypes";

interface ButtonProps {
    title: string;
    onPress: () => void;
    icon?: string;
    mode?: "text" | "outlined" | "contained" | "elevated" | "contained-tonal";
    disabled?: boolean;
    style?: StyleProp<ViewStyle>
}

const TertiaryButton: React.FC<ButtonProps> = ({ title, onPress, icon, disabled, mode = 'contained', style }) => {
    const theme = useTheme(); // thi

    return (
        <PaperButton textColor={theme.colors.onTertiary} style={{backgroundColor: theme.colors.tertiary, ...style as ViewStyle}} icon={icon}  mode={mode} onPress={onPress} disabled={disabled} >
            {title}
        </PaperButton>
    );
};

export default TertiaryButton;
