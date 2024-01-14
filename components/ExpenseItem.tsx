// src/components/ExpenseItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, IconButton, Paragraph, Chip } from 'react-native-paper';
import { Expense } from '../types';
import commonItemStyles from "./common/commonItemStyles";
import UserDetails from "./common/UserDetails";
import commonStyles from "./common/commonStyles";

interface ExpenseItemProps {
    expense: Expense;
    onPress: () => void;
    onDelete: () => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onPress, onDelete }) => (
    <TouchableOpacity onPress={onPress}>
        <Card style={commonItemStyles.card}>
            <Card.Content style={expense.tags.length ? commonItemStyles.cardContent: {}}>
                <View  style={commonItemStyles.titleContainer}>
                    <Title>
                        {expense.expenseType.isReceivingUser
                            ? `${expense.expenseType.expenseTypeName} to ${expense.receivingUser.username}`
                            : expense.expenseType.expenseTypeName}
                    </Title>
                    <Text>
                        {expense.user && <UserDetails user={expense.user} />} {/* Use UserDetails component */}
                    </Text>
                </View>
                <View style={commonStyles.row}>
                    <Paragraph>{`Date: ${expense.date.toDateString()}`}</Paragraph>
                    <Paragraph>{`Time: ${expense.date.toLocaleTimeString()}`}</Paragraph>
                </View>
                <View style={commonStyles.row}>
                    <Paragraph>{`Amount: ${expense.amount}`}</Paragraph>
                    {expense.additionalInfo && <Paragraph>{`Additional Info: ${expense.additionalInfo}`}</Paragraph>}
                </View>
                {expense.tags.length > 0 && (
                    <View style={commonItemStyles.tagsContainer}>
                        <Text style={commonItemStyles.tagsLabel}>Tags: </Text>
                        <View style={commonItemStyles.tagChipsContainer}>
                            {expense.tags.map((tag) => (
                                <Chip key={tag.id} style={commonItemStyles.tagChip}>
                                    {tag.tagName}
                                </Chip>
                            ))}
                        </View>
                    </View>
                )}
            </Card.Content>
            <Card.Actions style={expense.tags.length ? commonItemStyles.cardActions : {}}>
                <IconButton icon="delete" onPress={onDelete} />
            </Card.Actions>
        </Card>
    </TouchableOpacity>
);

export default ExpenseItem;
