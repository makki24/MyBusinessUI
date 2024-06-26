import commonStyles from "../../styles/commonStyles";
import { Switch, Text } from "react-native-paper";
import { View } from "react-native";
import React, { Dispatch, SetStateAction } from "react";

interface SwitchInputDynamicLabelProps {
  valueState: [boolean, Dispatch<SetStateAction<boolean>>];
  trueLabel: string;
  falseLabel: string;
}

const SwitchInputDynamicLabel: React.FC<SwitchInputDynamicLabelProps> = ({
  valueState,
  trueLabel,
  falseLabel,
}) => {
  const [isTrue, setIsTrue] = valueState;

  return (
    <View style={commonStyles.simpleRow}>
      <Switch
        value={isTrue}
        onValueChange={(value) => {
          setIsTrue(value);
        }}
      />
      <Text>{isTrue ? trueLabel : falseLabel}</Text>
    </View>
  );
};

export default SwitchInputDynamicLabel;
