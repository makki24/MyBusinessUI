import React from "react";
import { TextInput } from "react-native-paper";
import { UI_ELEMENTS_GAP } from "../../src/styles/constants";

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
      style={{ marginBottom: UI_ELEMENTS_GAP }}
      mode="outlined"
      disabled={disabled}
    />
  );
};

export default NumberInput;

