// src/screens/ExpenseScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { FAB, Text, Button, Modal, Portal } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import ExpenseService from '../services/ExpenseService';
import ExpenseItem from '../components/ExpenseItem';
import { expensesState } from '../recoil/atom';
import {Expense, User} from '../types';
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import SearchAndFilter from "../components/common/SearchAndFilter";
import workService from "../services/WorkService";
import expenseService from "../services/ExpenseService";

const ExpenseScreen = ({ navigation }) => {
    const [expenses, setExpenses] = useRecoilState(expensesState);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [senders, setSenders] = useState<User[]>([]);
    const [receivers, setReceivers] = useState<User[]>([]);

    const transFormAndSetExpense = (expensesData: Expense[]) => {
        expensesData = expensesData.map(expense => ({
            ...expense,
            date: new Date(expense.date)
        }))
        setExpenses(expensesData);
    }

    const fetchExpenses = async () => {
        try {
            setIsRefreshing(true);

            let expensesData = await ExpenseService.getExpenses();
            let sendersSet: User[] = []
            let receiverSet: User[] = []
            expensesData.forEach(expn => {
                if (expn.sender && !sendersSet.find(user => user.id === expn.sender.id))
                    sendersSet.push(expn.sender)
                if (expn.receiver && !receiverSet.find(user => user.id === expn.receiver.id))
                    receiverSet.push(expn.receiver);
            })
            setSenders(sendersSet);
            setReceivers([...receiverSet]);
            transFormAndSetExpense(expensesData)
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

    const handleEditExpense = (expense: Expense) => {
        const serializedDate = expense.date.toISOString();

        navigation.navigate('ExpenseStack', {
            screen: 'AddExpense',
            params: { title: `Edit Expense`, expense: {...expense, date: serializedDate}, isEditMode: true },
        });
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

    const handleSearch = (query) => {
        setSearchQuery(query);

    }

    const onApply = async (arg) => {
        setIsLoading(true)
        try {
            const filteredExpenses = await expenseService.filterExpense(arg)
            transFormAndSetExpense(filteredExpenses)
        }
        catch (e) {
            setError(e.message  || 'Error setting filters.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={commonStyles.container}>
            <LoadingError error={error} isLoading={isLoading} />
            <SearchAndFilter  searchQuery={searchQuery} handleSearch={handleSearch} sender={senders} receiver={receivers} onApply={onApply} />
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

            <FAB style={commonScreenStyles.fab} icon="plus" onPress={() => navigation.navigate('AddExpense')} />

            {/* Delete Expense Modal */}
            <Portal>
                <Modal visible={isDeleteModalVisible} onDismiss={() => setIsDeleteModalVisible(false)} contentContainerStyle={commonStyles.modalContainer}>
                    <Text>Are you sure you want to delete this expense?</Text>
                    <View style={commonStyles.modalButtonGap} />
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={() => setIsDeleteModalVisible(false)}>
                        Cancel
                    </Button>
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="delete" mode="contained" onPress={confirmDeleteExpense}>
                        Delete
                    </Button>
                </Modal>
            </Portal>
        </View>
    );
};

export default ExpenseScreen;
