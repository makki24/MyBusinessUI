import { TextInput } from "react-native-paper";
import React, { useState } from "react";
import commonAddScreenStyles from "../../styles/commonAddScreenStyles";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { TextStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

interface NumericInputProps {
  initialValue: string;
  onChange: (arg: string) => void;
  label?: string;
  disabled?: boolean;
  style?: StyleProp<TextStyle> | undefined;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  initialValue,
  onChange,
  label,
  disabled,
  style,
}) => {
  const [value, setValue] = useState(initialValue);

  return (
    <>
      <TextInput
        keyboardType="numeric"
        label={label}
        value={value}
        onChangeText={(text) => {
          setValue(text);
          onChange(text);
        }}
        testID={label?.split(" ").join("")}
        style={style ?? commonAddScreenStyles.inputField}
        disabled={disabled}
      />
    </>
  );
};

export default NumericInput;
