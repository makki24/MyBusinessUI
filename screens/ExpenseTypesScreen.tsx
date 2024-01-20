import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { FAB, Text, Button, Modal, Portal, Snackbar } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import { expenseTypesState } from '../recoil/atom';
import ExpenseTypesService from '../services/ExpenseTypesService';
import ExpenseTypeItem from '../components/ExpenseTypeItem';
import { ExpenseType } from '../types';
import commonScreenStyles from "../components/common/commonScreenStyles";
import commonStyles from "../components/common/commonStyles";
import LoadingError from "../components/common/LoadingError";

const ExpenseTypesScreen = ({ navigation }) => {
    const [expenseTypes, setExpenseTypes] = useRecoilState(expenseTypesState);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedExpenseType, setSelectedExpenseType] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);

    const fetchExpenseTypes = async () => {
        try {
            setIsRefreshing(true);

            const expenseTypesData = await ExpenseTypesService.getExpenseTypes();
            setExpenseTypes(expenseTypesData);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error('Error fetching expense types:', error.response?.data || 'Unknown error');
            setError(error.response?.data?.error ?? (error.response?.data || 'Error fetching expense types. Please try again.'));
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchExpenseTypes();
    }, []);

    const handleEditExpenseType = (expenseType) => {
        navigation.navigate('EditExpenseType', { expenseType });
    };

    const handleDeleteExpenseType = (expenseType) => {
        setSelectedExpenseType(expenseType);
        setIsDeleteModalVisible(true);
    };

    const confirmDeleteExpenseType = async () => {
        setIsLoading(true);

        try {
            await ExpenseTypesService.deleteExpenseType(selectedExpenseType.id);
            setExpenseTypes((prevExpenseTypes) =>
                prevExpenseTypes.filter((expenseType) => expenseType.id !== selectedExpenseType.id)
            );
            setSnackbarVisible(true);
        } catch (error) {
            console.error('Error deleting expense type:', error.response?.data || 'Unknown error');
            setError(error.response?.data || 'Error deleting expense type. Please try again.');
        } finally {
            setIsLoading(false);
            setSelectedExpenseType(null);
            setIsDeleteModalVisible(false);
        }
    };

    const handleRefresh = () => {
        fetchExpenseTypes();
    };

    const onSnackbarDismiss = () => {
        setSnackbarVisible(false);
    };

    return (
        <View style={commonStyles.container}>
            <LoadingError error={error} isLoading={isLoading} />

            {!error && (
                <FlatList
                    data={expenseTypes}
                    renderItem={({ item }) => (
                        <ExpenseTypeItem
                            expenseType={item}
                            onPress={() => handleEditExpenseType(item)}
                            onDelete={() => handleDeleteExpenseType(item)}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()} // Ensure key is a string
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                />
            )}

            <FAB style={commonScreenStyles.fab} icon="plus" onPress={() => navigation.navigate('AddExpenseType')} />

            {/* Delete ExpenseType Modal */}
            <Portal>
                <Modal
                    visible={isDeleteModalVisible}
                    onDismiss={() => setIsDeleteModalVisible(false)}
                    contentContainerStyle={commonStyles.modalContainer}
                >
                    <Text>Are you sure you want to delete this expense type?</Text>
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={() => setIsDeleteModalVisible(false)}>
                        Cancel
                    </Button>
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="delete" mode="contained" onPress={confirmDeleteExpenseType}>
                        Delete
                    </Button>
                </Modal>
            </Portal>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={onSnackbarDismiss}
                duration={3000}
            >
                Expense type deleted successfully
            </Snackbar>
        </View>
    );
};

export default ExpenseTypesScreen;
