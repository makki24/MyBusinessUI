// Button.tsx
import React from 'react';
import {Button as PaperButton} from "react-native-paper";

interface ButtonProps {
    title: string;
    onPress: () => void;
    icon?: string;
    mode?: "text" | "outlined" | "contained" | "elevated" | "contained-tonal";
}

const Button: React.FC<ButtonProps> = ({ title, onPress, icon, mode }) => {
    return (
        <PaperButton icon={icon}  mode={mode} onPress={onPress}>
            {title}
        </PaperButton>
    );
};

export default Button;
