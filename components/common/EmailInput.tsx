// EmailInput.js
import React, { useEffect, useState } from "react";
import { HelperText, TextInput } from "react-native-paper";
import { Text, View } from "react-native";

const EmailInput = ({ label, email, setEmail, onValidationChange, style }) => {
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    var re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
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
