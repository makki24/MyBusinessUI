// src/components/LoanTransactionItem.tsx
import React from "react";
import { Card, Paragraph, IconButton } from "react-native-paper";
import { View, Text, TouchableOpacity } from "react-native";
import UserDetails from "./common/UserDetails";
import { LoanToHoldingTransaction } from "../types";
import commonItemStyles from "../src/styles/commonItemStyles";

interface LoanTransactionItemProps {
  transaction: LoanToHoldingTransaction;
  onDelete: () => void; // Added onDelete prop
  onPress: () => void;
  testID?: string;
}

const LoanTransactionItem: React.FC<LoanTransactionItemProps> = ({
  transaction,
  onDelete,
  onPress,
}) => {
  const renderUserDetails = () =>
    transaction.user && <UserDetails user={transaction.user} />;

  return (
    <TouchableOpacity onPress={onPress} testID={"transaction-item"}>
      <Card style={commonItemStyles.card}>
        <Card.Content>
          <View style={commonItemStyles.titleContainer}>
            <View>
              <Paragraph>{`Date: ${transaction.date.toDateString()}`}</Paragraph>
              <Paragraph>{`Amount: ${transaction.amount}`}</Paragraph>
            </View>
            <Text>{renderUserDetails()}</Text>
          </View>
        </Card.Content>
        <Card.Actions>
          <IconButton testID={"delete"} icon="delete" onPress={onDelete} />
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  );
};

export default LoanTransactionItem;
