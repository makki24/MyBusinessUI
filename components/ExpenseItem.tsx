// src/components/ExpenseItem.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Card, Title, IconButton, Paragraph, Text } from "react-native-paper";
import { Expense } from "../types";
import commonItemStyles from "../src/styles/commonItemStyles";
import UserDetails from "./common/UserDetails";
import commonStyles from "../src/styles/commonStyles";
import Labels from "./common/Labels";

interface ExpenseItemProps {
  expense: Expense;
  onPress: () => void;
  onDelete: () => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onPress,
  onDelete,
}) => (
  <TouchableOpacity onPress={onPress}>
    <Card style={commonItemStyles.card}>
      <Card.Content
        style={expense.tags.length ? commonItemStyles.cardContent : {}}
      >
        <View style={commonItemStyles.titleContainer}>
          <Title>
            {expense.type.isReceivingUser
              ? `${expense.type.name} to ${expense.receiver.name}`
              : expense.type.name}
          </Title>
          <Text>
            {expense.sender && <UserDetails user={expense.sender} />}{" "}
            {/* Use UserDetails component */}
          </Text>
        </View>
        <View style={commonStyles.row}>
          <Paragraph>{`Date: ${expense.date.toDateString()}`}</Paragraph>
          <Paragraph>{`Time: ${expense.date.toLocaleTimeString()}`}</Paragraph>
        </View>
        <View style={commonStyles.row}>
          <Paragraph>{`Amount: ${expense.amount}`}</Paragraph>
          {expense.description && (
            <Paragraph>{`Additional Info: ${expense.description}`}</Paragraph>
          )}
        </View>
        {expense.tags.length > 0 && (
          <Labels label={"Tags"} items={expense.tags} />
        )}
      </Card.Content>
      <Card.Actions
        style={
          expense.tags.length
            ? commonItemStyles.cardActionsWithTags
            : commonItemStyles.cardActions
        }
      >
        <IconButton icon="delete" onPress={onDelete} />
      </Card.Actions>
    </Card>
  </TouchableOpacity>
);

export default ExpenseItem;
