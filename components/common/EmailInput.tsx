// EmailInput.js
import React, { useEffect, useState } from "react";
import { HelperText, TextInput } from "react-native-paper";
import { View } from "react-native";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

type EmailInputProps = {
  label: string;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  onValidationChange: (arg1: boolean) => void;
  style: StyleProp<ViewStyle>;
};

const EmailInput: React.FC<EmailInputProps> = ({
  label,
  email,
  setEmail,
  onValidationChange,
  style,
}) => {
  const [emailError, setEmailError] = useState("");

  const validateEmail = (emailArg) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(emailArg);
  };

  useEffect(() => {
    // Notify the parent component about the validation status
    onValidationChange(!emailError);
  }, [emailError]);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (!validateEmail(text)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  return (
    <View>
      <TextInput
        label={label}
        value={email}
        onChangeText={handleEmailChange}
        error={!!emailError}
        style={style}
        testID={label.split(" ").join("")}
      />
      {!!emailError && (
        <HelperText type="error" visible={!!emailError}>
          {emailError}
        </HelperText>
      )}
    </View>
  );
};

export default EmailInput;
