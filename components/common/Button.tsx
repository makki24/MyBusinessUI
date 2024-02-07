// Button.tsx
import React from 'react';
import {Button as PaperButton} from "react-native-paper";

interface ButtonProps {
    title: string;
    onPress: () => void;
    icon?: string;
    mode?: "text" | "outlined" | "contained" | "elevated" | "contained-tonal";
    disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({ title, onPress, icon, disabled, mode = 'contained' }) => {
    return (
        <PaperButton icon={icon}  mode={mode} onPress={onPress} disabled={disabled}>
            {title}
        </PaperButton>
    );
};

export default Button;
