import { Text, useTheme } from "react-native-paper";
import { View, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useCallback } from "react";
import { User } from "../../../types";
import BalanceService from "../../../services/BalanceService";

interface UserRemainingAmountProps {
  user: User;
}

const UserRemainingAmount: React.FC<UserRemainingAmountProps> = ({ user }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      if (user.id) {
        BalanceService.getUserBalance(user.id)
          .then((res) => {
            setBalance(res.netBalance);
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error("Failed to fetch balance for user:", user.id, err);
            setBalance(0);
          });
      }
    }, [user.id]),
  );

  if (balance === null) {
    return <ActivityIndicator size="small" />;
  }

  // balance > 0 means Family owes User (Business has to pay)
  // balance < 0 means User owes Family (Business has to receive)
  const toRecieve = balance < 0;
  const amount = Math.abs(balance);

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
