import React from "react";
import { TextInput } from "react-native-paper";
import commonAddScreenStyles from "../../src/styles/commonAddScreenStyles";

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: React.Dispatch<React.SetStateAction<string>>;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChangeText,
}) => {
  return (
    <TextInput
      keyboardType="numeric"
      label={label}
      value={value}
      onChangeText={onChangeText}
      testID={label.split(" ").join("")}
      style={commonAddScreenStyles.inputField}
    />
  );
};

export default NumberInput;
