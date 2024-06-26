import React from "react";
import { TextInput } from "react-native-paper";
import commonAddScreenStyles from "../../src/styles/commonAddScreenStyles";

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChangeText,
  disabled,
}) => {
  return (
    <TextInput
      keyboardType="numeric"
      label={label}
      value={value}
      onChangeText={onChangeText}
      testID={label.split(" ").join("")}
      style={commonAddScreenStyles.inputField}
      disabled={disabled}
    />
  );
};

export default NumberInput;
