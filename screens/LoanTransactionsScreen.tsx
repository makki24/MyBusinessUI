// src/screens/LoanTransactionScreen.tsx
import React, { useEffect, useState } from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator, RefreshControl, ScrollView} from 'react-native';
import {FAB, Text, Button, Modal, Portal, Snackbar} from 'react-native-paper';
import { useRecoilState } from 'recoil';
import LoanTransactionItem from '../components/LoanTransactionItem';
import { loanToHoldingTransactionState, userState } from '../recoil/atom';
import { LoanToHoldingTransaction } from '../types';
import contributionService from "../services/ContributionService";
import commonScreenStyles from "../components/common/commonScreenStyles";
import commonStyles from "../components/common/commonStyles";
import LoadingError from "../components/common/LoadingError";

const LoanTransactionScreen = ({ navigation }) => {
    const [loanTransactions, setLoanTransactions] = useRecoilState(loanToHoldingTransactionState);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<LoanToHoldingTransaction>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [loggedInUser, setLoggedInUser] = useRecoilState(userState);
    const [snackbarVisible, setSnackbarVisible] = useState(false);

    const fetchLoanTransactions = async () => {
        try {
            setIsRefreshing(true);

            let transactionsData = await contributionService.getLoanClearTransactions();
            transactionsData = transactionsData.map(transaction => ({
                ...transaction,
                date: new Date(transaction.date)
            }));
            setLoanTransactions(transactionsData);
        } catch (error) {
            console.error('Error fetching loan transactions:', error.message || 'Unknown error');
            setError(error.message || 'Error fetching loan transactions. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLoanTransactions();
    }, []);

    const handleRefresh = () => {
        fetchLoanTransactions();
    };

    const handleEditTransaction = (item: LoanToHoldingTransaction) => {
        const serializedDate = item.date.toISOString();

        navigation.navigate('ProfileStack', { screen: 'ManageAmounts', params: { title: 'Edit transaction', transaction: {...item, date: serializedDate}, isEditMode: true}})
    }

    const handleDeleteTransaction = async (transaction) => {
        setSelectedTransaction(transaction);
        setIsLoading(true);

        try {
            setIsDeleteModalVisible(true);
        } catch (error) {
            console.error('Error checking loan transaction details:', error.response?.data || 'Unknown error');
            setError(error.message || 'Error checking loan transaction details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDeleteTransaction = async () => {
        setIsLoading(true);

        try {
            await contributionService.deleteLoanClearTransactions(selectedTransaction.id);
            setSnackbarVisible(true);
            setLoanTransactions((prevTransactions) => prevTransactions.filter((transaction) => transaction.id !== selectedTransaction.id));
        } catch (error) {
            console.error('Error deleting loan transaction:', error.response?.data || 'Unknown error');
            setError(error.message || 'Error deleting loan transaction. Please try again.');
        } finally {
            setIsLoading(false);
            setSelectedTransaction(null);
            setIsDeleteModalVisible(false);
        }
    };

    return (
        <View style={commonStyles.container}>
            <LoadingError error={error} isLoading={isLoading} />

            {!error && (
                <FlatList
                    data={loanTransactions}
                    renderItem={({ item }) => (
                        <LoanTransactionItem
                            onPress={() => handleEditTransaction(item)}
                            onDelete={() => handleDeleteTransaction(item)}
                            transaction={item}
                            testID={`transaction-item-${item.id}`}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()} // Ensure key is a string
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                    testID="loan-transaction-list"
                />
            )}

            {/* Delete Transaction Modal */}
            <Portal>
                <Modal visible={isDeleteModalVisible} onDismiss={() => setIsDeleteModalVisible(false)} contentContainerStyle={commonStyles.modalContainer} testID="delete-modal">
                    <Text testID="delete-modal-text">Are you sure you want to delete this loan transaction?</Text>
                    <View style={commonStyles.modalButtonGap} />
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={() => setIsDeleteModalVisible(false)} testID="cancel-delete-button">
                        Cancel
                    </Button>
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="delete" mode="contained" onPress={confirmDeleteTransaction} testID="confirm-delete-button">
                        Delete
                    </Button>
                </Modal>
            </Portal>

            <FAB
                style={commonScreenStyles.fab}
                icon="plus"
                onPress={() => navigation.navigate('ProfileStack', { screen: 'ManageAmounts', params: { title: 'Manage Amounts' }})}
                testID="add-transaction-fab"
            />
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                action={{
                    label: 'OK',
                    onPress: () => setSnackbarVisible(false),
                }}
                testID="snackbar"
            >
                Transaction deleted successfully!
            </Snackbar>
        </View>
    );
};

export default LoanTransactionScreen;
