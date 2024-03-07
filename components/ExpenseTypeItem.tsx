// src/components/ExpenseTypeItem.tsx
import React from "react";
import { Card, Title, IconButton } from "react-native-paper";
import { ExpenseType } from "../types";
import commonItemStyles from "../src/styles/commonItemStyles";

interface ExpenseTypeItemProps {
  expenseType: ExpenseType;
  onPress: () => void;
  onDelete: () => void;
}

const ExpenseTypeItem: React.FC<ExpenseTypeItemProps> = ({
  expenseType,
  onDelete,
}) => (
  <Card style={commonItemStyles.card}>
    <Card.Content style={commonItemStyles.cardContent}>
      <Title>{expenseType.name}</Title>
    </Card.Content>
    <Card.Actions style={commonItemStyles.cardActions}>
      <IconButton icon="delete" onPress={onDelete} />
    </Card.Actions>
  </Card>
);

export default ExpenseTypeItem;
