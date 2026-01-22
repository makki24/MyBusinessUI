import { Text, useTheme } from "react-native-paper";
import { View } from "react-native";
import React from "react";
import { User } from "../../../types";

interface UserRemainingAmountProps {
  user: User;
}

const UserRemainingAmount: React.FC<UserRemainingAmountProps> = ({ user }) => {
  let amount = Math.abs(user.amountToReceive - user.amountHolding);
  amount = Math.round(amount * 100.0) / 100.0;
  const toRecieve = user.amountHolding > user.amountToReceive;
  const theme = useTheme();

  return (
    <View>
      <Text
        variant={"titleLarge"}
        style={{
          color: toRecieve ? theme.colors.primary : theme.colors.error,
        }}
      >
        {new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: "INR",
        }).format(amount)}
      </Text>
    </View>
  );
};

export default UserRemainingAmount;
