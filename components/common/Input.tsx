// Input.tsx
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import {KeyboardTypeOptions} from "react-native/Libraries/Components/TextInput/TextInput";

interface InputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: KeyboardTypeOptions;
}

const Input: React.FC<InputProps> = ({ placeholder, value, onChangeText, keyboardType }) => {
    return (
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
});

export default Input;
