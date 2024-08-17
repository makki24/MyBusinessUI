// src/components/ExpenseTypeItem.tsx
import React from "react";
import { Card, Title, IconButton } from "react-native-paper";
import { ExpenseType } from "../types";
import commonItemStyles from "../src/styles/commonItemStyles";
import { TouchableOpacity } from "react-native";

interface ExpenseTypeItemProps {
  expenseType: ExpenseType;
  onPress: () => void;
  onDelete: () => void;
}

const ExpenseTypeItem: React.FC<ExpenseTypeItemProps> = ({
  expenseType,
  onDelete,
  onPress,
}) => (
  <TouchableOpacity onPress={() => onPress()}>
    <Card style={commonItemStyles.card}>
      <Card.Content style={commonItemStyles.cardContent}>
        <Title>{expenseType.name}</Title>
      </Card.Content>
      <Card.Actions style={commonItemStyles.cardActionsWithTags}>
        <IconButton icon="delete" onPress={onDelete} />
      </Card.Actions>
    </Card>
  </TouchableOpacity>
);

export default ExpenseTypeItem;
