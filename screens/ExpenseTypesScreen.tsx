import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { FAB, Text, Button, Modal, Portal, Snackbar } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import { expenseTypesState } from '../recoil/atom';
import ExpenseTypesService from '../services/ExpenseTypesService';
import ExpenseTypeItem from '../components/ExpenseTypeItem';
import { ExpenseType } from '../types';

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

            <FAB style={styles.fab} icon="plus" onPress={() => navigation.navigate('AddExpenseType')} />

            {/* Delete ExpenseType Modal */}
            <Portal>
                <Modal
                    visible={isDeleteModalVisible}
                    onDismiss={() => setIsDeleteModalVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <Text>Are you sure you want to delete this expense type?</Text>
                    <View style={styles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={() => setIsDeleteModalVisible(false)}>
                        Cancel
                    </Button>
                    <View style={styles.modalButtonGap} />
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

export default ExpenseTypesScreen;
