import React from "react";
import { TextInput } from "react-native-paper";
import commonAddScreenStyles from "../../src/styles/commonAddScreenStyles";

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any;
  dense?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChangeText,
  disabled,
  style,
  dense,
}) => {
  return (
    <TextInput
      keyboardType="numeric"
      label={label}
      value={value}
      onChangeText={onChangeText}
      testID={label.split(" ").join("")}
      style={[commonAddScreenStyles.inputField, style]}
      disabled={disabled}
      dense={dense}
    />
  );
};

export default NumberInput;
