// src/screens/AddExpenseTypeScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useRecoilState } from 'recoil';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ExpenseTypesService from '../services/ExpenseTypesService'; // Adjust the path accordingly
import { expenseTypesState } from '../recoil/atom'; // Adjust the path accordingly
import { ExpenseType } from '../types';

interface AddExpenseTypeScreenProps {
    navigation: any; // Adjust the type based on your navigation prop type
}

const AddExpenseTypeScreen: React.FC<AddExpenseTypeScreenProps> = ({ navigation }) => {
    const [expenseTypeName, setExpenseTypeName] = useState('');
    const [expenseTypes, setExpenseTypes] = useRecoilState(expenseTypesState);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddExpenseType = async () => {
        try {
            if (!expenseTypeName) {
                setError('Expense type name is required'); // Set the error message
                return;
            }

            setIsLoading(true); // Set loading to true

            // Call your API service to add a new expense type
            const newExpenseType = await ExpenseTypesService.addExpenseType({
                expenseTypeName,
            });

            // Update Recoil state with the new expense type
            setExpenseTypes((prevExpenseTypes) => [...prevExpenseTypes, newExpenseType]);

            // Navigate back to the previous screen
            navigation.goBack();
        } catch (error) {
            console.error('Error adding expense type:', error.response.data);
            setError(error.response.data?.error || error.response?.data || 'An error occurred'); // Set the error message
        } finally {
            setIsLoading(false); // Set loading to false regardless of success or failure
        }
    };

    return (
        <View style={styles.container}>
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Text>
                        <ActivityIndicator size="large" color="#0000ff" /> {/* Show spinner if loading */}
                    </Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <Input
                placeholder="Enter expense type name"
                value={expenseTypeName}
                onChangeText={setExpenseTypeName}
            />
            <Button title="Add Expense Type" onPress={handleAddExpenseType} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
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
});

export default AddExpenseTypeScreen;
