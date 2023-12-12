// src/components/ExpenseItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, IconButton, Paragraph, Chip } from 'react-native-paper';
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
                <Title>
                    {expense.expenseType.isReceivingUser
                        ? `${expense.expenseType.expenseTypeName} to ${expense.receivingUser.username}`
                        : expense.expenseType.expenseTypeName}
                </Title>
                <Paragraph>{`Date: ${expense.date.toDateString()}`}</Paragraph>
                <Paragraph>{`Time: ${expense.date.toLocaleTimeString()}`}</Paragraph>
                <Paragraph>{`User: ${expense.user.username}`}</Paragraph>
                <Paragraph>{`Amount: ${expense.amount}`}</Paragraph>
                {expense.additionalInfo && <Paragraph>{`Additional Info: ${expense.additionalInfo}`}</Paragraph>}
                {expense.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        <Text style={styles.tagsLabel}>Tags: </Text>
                        <View style={styles.tagChipsContainer}>
                            {expense.tags.map((tag) => (
                                <Chip key={tag.id} style={styles.tagChip}>
                                    {tag.tagName}
                                </Chip>
                            ))}
                        </View>
                    </View>
                )}
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
    tagsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    tagsLabel: {
        fontWeight: 'bold',
        marginRight: 8,
    },
    tagChipsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagChip: {
        marginHorizontal: 4,
    },
});

export default ExpenseItem;
