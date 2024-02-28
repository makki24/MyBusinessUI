// Input.tsx
import React from 'react';
import {KeyboardTypeOptions} from "react-native/Libraries/Components/TextInput/TextInput";
import commonAddScreenStyles from "../../src/styles/commonAddScreenStyles";
import {TextInput} from "react-native-paper";

interface InputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: KeyboardTypeOptions;
}

const Input: React.FC<InputProps> = ({ placeholder, value, onChangeText, keyboardType }) => {
    return (
        <TextInput
            style={commonAddScreenStyles.inputField}
            label={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
        />
    );
};

export default Input;
