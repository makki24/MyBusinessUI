// src/components/ExpenseTypeItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, IconButton } from 'react-native-paper';
import { ExpenseType } from '../types';

interface ExpenseTypeItemProps {
    expenseType: ExpenseType;
    onPress: () => void;
    onDelete: () => void;
}

const ExpenseTypeItem: React.FC<ExpenseTypeItemProps> = ({ expenseType, onPress, onDelete }) => (
        <Card style={styles.expenseTypeCard}>
            <Card.Content>
                <Title>{expenseType.expenseTypeName}</Title>
            </Card.Content>
            <Card.Actions>
                <IconButton icon="delete" onPress={onDelete} />
            </Card.Actions>
        </Card>
);

const styles = StyleSheet.create({
    expenseTypeCard: {
        marginBottom: 16,
    },
});

export default ExpenseTypeItem;
