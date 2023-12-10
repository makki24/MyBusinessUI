import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { useRecoilState, useRecoilValue } from 'recoil';
import DropDownPicker, {DropDownPickerProps} from 'react-native-dropdown-picker';
import { Button, TextInput, Modal as PaperModal, Portal } from 'react-native-paper';
import { DatePickerInput, TimePickerModal } from 'react-native-paper-dates';

import { expenseTypesState, userState, usersState, expensesState } from '../recoil/atom';
import ExpenseService from '../services/ExpenseService';
import ExpenseTypesService from '../services/ExpenseTypesService';
import UserService from '../services/UserService';
import {ExpenseType, User} from "../types";

interface AddExpenseScreenProps {
    navigation: any;
}

DropDownPicker.setListMode('SCROLLVIEW');

const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({ navigation }) => {
    const [expenseTypes, setExpenseTypes] = useRecoilState(expenseTypesState);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [inputDate, setInputDate] = useState(new Date());
    const [time, setTime] = useState<{ hours: number | undefined; minutes: number | undefined }>({
        hours: new Date().getHours(),
        minutes: new Date().getMinutes(),
    });
    const [timeOpen, setTimeOpen] = useState(false);
    const [users, setUsers] = useRecoilState(usersState);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [isReceivingUser, setIsReceivingUser] = useState<boolean>(false);
    const [expenses, setExpenses] = useRecoilState(expensesState);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isAmountHoldingLess, setIsAmountHoldingLess] = useState(false);

    const [loggedInUser, setLoggedInUser] = useRecoilState(userState);

    const onConfirmTime = useCallback(
        ({ hours, minutes }: any) => {
            setTimeOpen(false);
            setTime({ hours, minutes });
        },
        [setTimeOpen, setTime]
    );

    const onDismissTime = useCallback(() => {
        setTimeOpen(false);
    }, [setTimeOpen]);

    const timeFormatter = React.useMemo(
        () =>
            new Intl.DateTimeFormat('en', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }),
        []
    );

    // Fetch users from the UserService
    const fetchUsers = async () => {
        try {
            const fetchedUsers = await UserService.getUsers();
            setUsers(fetchedUsers.filter(user => user.id !== loggedInUser.id));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const maxFontSizeMultiplier = 1.5;
    let timeDate = new Date();
    time.hours !== undefined && timeDate.setHours(time.hours);
    time.minutes !== undefined && timeDate.setMinutes(time.minutes);

    const fetchExpenseTypes = async () => {
        try {
            const fetchedExpenseTypes = await ExpenseTypesService.getExpenseTypes();
            setExpenseTypes(fetchedExpenseTypes);
        } catch (error) {
            console.error('Error fetching expense types:', error);
        }
    };

    useEffect(() => {
        fetchExpenseTypes();
    }, []);

    // Handler for changing the selected expense type
    const handleExpenseTypeChange = (selectedExpenseType: string | null) => {
        setSelectedUser(null);
        setIsReceivingUser(expenseTypes.some((type) => type.id === selectedExpenseType && type.isReceivingUser));
    };

    const handleUserChange = (user) => {
        if (user)
            setSelectedUser(user);
    }

    const handleModalClose = () => {
        setModalVisible(false);
        setIsAmountHoldingLess(false); // Reset the isAmountHoldingLess state when the modal is closed
    };

    const submitExpense = async () => {
        try {
            setModalVisible(false)
            setIsLoading(true);
            const expenseDate = new Date(inputDate);
            expenseDate.setHours(time.hours, time.minutes);

            const newExpense = await ExpenseService.addExpense({
                date: expenseDate,
                expenseType: {id: value} as ExpenseType,
                amount: parseFloat(amount),
                additionalInfo,
                user: loggedInUser,
                receivingUser: selectedUser ? {id: selectedUser} as User : null
            });

            newExpense.date = new Date(newExpense.date);
            setExpenses((prevExpenses) =>  [...prevExpenses, newExpense]);

            setAmount('');
            setValue(null);
            setAdditionalInfo('');
            setLoggedInUser((currVal:User) => {
                let amountHolding = currVal.amountHolding - parseFloat(amount);
                let amountToReceive = currVal.amountToReceive;
                if (amountHolding < 0) {
                    amountHolding = currVal.amountHolding;
                    amountToReceive = currVal.amountToReceive + parseFloat(amount);
                }
                return {...currVal, amountHolding, amountToReceive}
            })

            navigation.goBack();
        }
        catch (error) {
            console.error('Error adding expense:', error.response);
            setError(error.response?.data ?? 'An error occurred while adding the expense');
        } finally {
           setIsLoading(false);
        }
    }


    // Handler for adding an expense
    const handleAddExpense = async () => {
        if (!value || !amount) {
            setError('Expense type and amount are required');
            return;
        }

        if (value === 'others' && !additionalInfo) {
            setError('Additional info is required for others expenses');
            return;
        }


        const selectedExpenseType = expenseTypes.find((type) => type.id === value);

        if (!selectedExpenseType) {
            setError('Invalid expense type selected');
            return;
        }

        if (selectedExpenseType?.isReceivingUser && !selectedUser) {
            setError('Please select a user for this expense type.');
            return;
        }

        if (isReceivingUser) {
            const receivingUser = users.filter(user => user.id === selectedUser)[0];
            if (parseFloat(amount) > receivingUser.amountToReceive) {
                setModalMessage(`The amount to be received (${receivingUser.amountToReceive}) is smaller than the entered amount (${amount}). Do you want to continue?`);
                setModalVisible(true);
                return;
            }
        }

        if (parseFloat(amount) > loggedInUser.amountHolding) {
            setModalMessage(`Amount holding is less. Please either declare contribution or this amount will be considered as loan. You already have the loan of ${loggedInUser.amountToReceive},  Do you want to continue?`);
            setIsAmountHoldingLess(true);
            setModalVisible(true);
            return;
        }


        submitExpense()
    };

    const navigateToManageAmounts = () => {
        setModalVisible(false)
        navigation.navigate('ProfileStack', { screen: 'ManageAmounts', params: { title: 'Manage Amounts' }})
    };


    // Component rendering
    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            {/* Loading indicator */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}

            {/* Error message display */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Expense type selector */}
            <DropDownPicker
                schema={{
                    label: 'expenseTypeName',
                    value: 'id',
                }}
                zIndex={3000}
                zIndexInverse={3000}
                items={expenseTypes}
                searchable={true}
                open={open}
                setOpen={setOpen}
                containerStyle={{ height: 40, marginBottom: 16 }}
                value={value}
                setValue={setValue}
                itemSeparator={true}
                onChangeValue={handleExpenseTypeChange}
            />

            {/* Additional selector for users if required */}
            {value && isReceivingUser && (
                <DropDownPicker
                    schema={{
                        label: 'username',
                        value: 'id',
                    }}
                    zIndex={2000}
                    zIndexInverse={2000}
                    items={users}
                    searchable={true}
                    open={userOpen}
                    setOpen={setUserOpen}
                    containerStyle={{ height: 40, marginBottom: 16 }}
                    value={selectedUser}
                    setValue={handleUserChange}
                    itemSeparator={true}
                    placeholder="Select User"
                    onChangeValue={handleUserChange}
                />
            )}

            {/* Input fields for amount and additional information */}
            <TextInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.inputField} />

            <TextInput
                label="Additional information (optional)"
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                style={styles.inputField}
            />

            {/* Date picker */}
            <DatePickerInput
                locale="en"
                label="Expense date"
                value={inputDate}
                onChange={(d) => setInputDate(d || new Date())}
                inputMode="start"
                style={styles.inputField}
            />

            {/* Time picker */}
            <View style={[styles.row, styles.marginVerticalEight]}>
                <View style={styles.section}>
                    <Text maxFontSizeMultiplier={maxFontSizeMultiplier} style={styles.bold}>
                        Time
                    </Text>
                    <Text maxFontSizeMultiplier={maxFontSizeMultiplier}>
                        {time && time.hours !== undefined && time.minutes !== undefined
                            ? timeFormatter.format(new Date().setHours(time.hours, time.minutes))
                            : `Current Time: ${timeFormatter.format(new Date())}`}
                    </Text>
                </View>
                <Button onPress={() => setTimeOpen(true)} uppercase={false} mode="contained-tonal">
                    Pick time
                </Button>
            </View>

            {/* Time picker modal */}
            <TimePickerModal
                locale={'en'}
                visible={timeOpen}
                onDismiss={onDismissTime}
                onConfirm={onConfirmTime}
                hours={time.hours}
                minutes={time.minutes}
            />

            {/* Button to add the expense */}
            <Button mode="contained" onPress={handleAddExpense}>
                Add Expense
            </Button>

            <Portal>
                <PaperModal visible={modalVisible} onDismiss={handleModalClose} contentContainerStyle={styles.modalContainer}>
                    <Text>{modalMessage}</Text>
                    <View style={styles.modalButtonGap} />
                    <Button icon="check" mode="contained" onPress={submitExpense}>
                        Continue
                    </Button>
                    {isAmountHoldingLess && (
                        <>
                            <View style={styles.modalButtonGap} />
                            <Button icon="account-cog" mode="contained" onPress={navigateToManageAmounts}>
                                Manage Amounts
                            </Button>
                        </>
                    )}
                    <View style={styles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={handleModalClose}>
                        Cancel
                    </Button>
                </PaperModal>
            </Portal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContainer: {
        justifyContent: 'center',
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
    bold: {
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
    },
    section: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    marginVerticalEight: {
        marginVertical: 8,
    },
    inputField: {
        marginBottom: 16,
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

export default AddExpenseScreen;
