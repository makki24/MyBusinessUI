import React from "react";
import {TextInput} from "react-native-paper";
import commonAddScreenStyles from "../../src/styles/commonAddScreenStyles";
import {StyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import {ViewStyle} from "react-native/Libraries/StyleSheet/StyleSheetTypes";

interface NumberInputProps {
    label: string;
    value: string;
    onChangeText:  React.Dispatch<React.SetStateAction<string>>
}

const NumberInput: React.FC<NumberInputProps> = ({label, value, onChangeText}) => {
    return (
        <TextInput
            keyboardType="numeric"
            label="Amount to Add"
            value={value}
            onChangeText={onChangeText}
            style={commonAddScreenStyles.inputField}
        />
    )
}

export default NumberInput;
