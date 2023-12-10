// src/screens/ExpenseScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { FAB, Text, Button, Modal, Portal } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import ExpenseService from '../services/ExpenseService';
import ExpenseItem from '../components/ExpenseItem';
import { expensesState } from '../recoil/atom';
import { Expense } from '../types';

const ExpenseScreen = ({ navigation }) => {
    const [expenses, setExpenses] = useRecoilState(expensesState);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const fetchExpenses = async () => {
        try {
            setIsRefreshing(true);

            let expensesData = await ExpenseService.getExpenses();
            expensesData = expensesData.map(expense => ({
                ...expense,
                date: new Date(expense.date)
            }))
            setExpenses(expensesData);
        } catch (error) {
            console.error('Error fetching expenses:', error.response?.data || 'Unknown error');
            setError(error.response?.data || 'Error fetching expenses. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleEditExpense = (expense) => {
        navigation.navigate('EditExpense', { expense });
    };

    const handleDeleteExpense = async (expense) => {
        setSelectedExpense(expense);
        setIsLoading(true);

        try {
            setIsDeleteModalVisible(true);
        } catch (error) {
            console.error('Error checking expense details:', error.response?.data || 'Unknown error');
            setError(error.response?.data || 'Error checking expense details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDeleteExpense = async () => {
        setIsLoading(true);

        try {
            await ExpenseService.deleteExpense(selectedExpense.id);
            setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== selectedExpense.id));
        } catch (error) {
            console.error('Error deleting expense:', error.response?.data || 'Unknown error');
            setError(error.response?.data || 'Error deleting expense. Please try again.');
        } finally {
            setIsLoading(false);
            setSelectedExpense(null);
            setIsDeleteModalVisible(false);
        }
    };

    const handleRefresh = () => {
        fetchExpenses();
    };

    return (
        <View style={styles.container}>
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}

            {!error && (
                <FlatList
                    data={expenses}
                    renderItem={({ item }) => (
                        <ExpenseItem
                            expense={item}
                            onPress={() => handleEditExpense(item)}
                            onDelete={() => handleDeleteExpense(item)}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()} // Ensure key is a string
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                />
            )}

            <FAB style={styles.fab} icon="plus" onPress={() => navigation.navigate('AddExpense')} />

            {/* Delete Expense Modal */}
            <Portal>
                <Modal visible={isDeleteModalVisible} onDismiss={() => setIsDeleteModalVisible(false)} contentContainerStyle={styles.modalContainer}>
                    <Text>Are you sure you want to delete this expense?</Text>
                    <View style={styles.modalButtonGap} />
                    <View style={styles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={() => setIsDeleteModalVisible(false)}>
                        Cancel
                    </Button>
                    <View style={styles.modalButtonGap} />
                    <Button icon="delete" mode="contained" onPress={confirmDeleteExpense}>
                        Delete
                    </Button>
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    errorContainer: {
        backgroundColor: 'red',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'white',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignSelf: 'center', // Center the modal on the screen
        width: '80%', // Set the width to a percentage of the screen width
    },
    modalButtonGap: {
        height: 5,
    },
});

export default ExpenseScreen;
