// src/components/ExpenseItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, IconButton, Paragraph } from 'react-native-paper';
import { Expense } from '../types';

interface ExpenseItemProps {
    expense: Expense;
    onPress: () => void;
    onDelete: () => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onPress, onDelete }) => (
    <TouchableOpacity onPress={onPress}>
        <Card style={styles.expenseCard}>
            <Card.Content>
                <Title>{expense.expenseType.expenseTypeName}</Title>
                <Paragraph>{`Date: ${expense.date.toDateString()}`}</Paragraph>
                <Paragraph>{`Time: ${expense.date.toLocaleTimeString()}`}</Paragraph>
                <Paragraph>{`User: ${expense.user.username}`}</Paragraph>
                <Paragraph>{`Amount: ${expense.amount}`}</Paragraph>
                {expense.additionalInfo && <Paragraph>{`Additional Info: ${expense.additionalInfo}`}</Paragraph>}
            </Card.Content>
            <Card.Actions>
                <IconButton icon="delete" onPress={onDelete} />
            </Card.Actions>
        </Card>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    expenseCard: {
        marginBottom: 16,
    },
});

export default ExpenseItem;
