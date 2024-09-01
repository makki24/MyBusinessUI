import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { NumericInput as CommonNumericInput } from "../common/NumericInput";

interface NumericInputProps {
  initialValue: string;
  onChange: (arg: string) => void;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  initialValue,
  onChange,
}) => {
  const [value] = useState(initialValue);

  return (
    <View>
      <CommonNumericInput
        initialValue={value}
        onChange={onChange}
        style={styles.input}
      />
    </View>
  );
};

export default NumericInput;

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: 80, // Fixed width for the input fields
    fontSize: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});
