import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { useRecoilState } from 'recoil';
import DropDownPicker from 'react-native-dropdown-picker';
import { TextInput, Modal as PaperModal, Portal } from 'react-native-paper';
import { DatePickerInput, TimePickerModal } from 'react-native-paper-dates';

import {
    expenseTypesState,
    userState,
    usersState,
    expensesState,
    tagsState,
} from '../recoil/atom';
import ExpenseService from '../services/ExpenseService';
import ExpenseTypesService from '../services/ExpenseTypesService';
import UserService from '../services/UserService';
import {Expense, ExpenseType, Tag as Tags, User} from "../types";
import CustomDropDown from "../components/common/CustomDropdown";
import TagsService from "../services/TagsService";
import commonAddScreenStyles from "../src/styles/commonAddScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import Button from "../components/common/Button";
import NumberInput from "../components/common/NumberInput";

interface AddExpenseScreenProps {
    navigation: any;
    route: {
        params: {
            isEditMode: boolean;
            expense: Expense;
        }
    };
}

DropDownPicker.setListMode('SCROLLVIEW');

const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({ route, navigation }) => {
    const [expenseTypes, setExpenseTypes] = useRecoilState(expenseTypesState);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [tagOpen, setTagOpen] = useState(false); // New selector for tags
    const [value, setValue] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<number[] >([]);
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
    const [tags, setTags] = useRecoilState(tagsState);
    const [isEdit, setIsEdit] = useState(false);


    const [loggedInUser, setLoggedInUser] = useRecoilState(userState);

    const onConfirmTime = useCallback(
        ({ hours, minutes }: any) => {
            setTimeOpen(false);
            setTime({ hours, minutes });
        },
        [setTimeOpen, setTime]
    );

    useEffect(() => {
        const isReceivingUser = expenseTypes.some((type) => type.id === value && type.isReceivingUser);
        setSelectedUser(null)
        setIsReceivingUser(isReceivingUser);
        if (route.params?.isEditMode && route.params?.expense && isReceivingUser)
            setSelectedUser(route.params.expense.receiver ? route.params.expense.receiver.id : null);

    }, [value])

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

    // Fetch users on component mount
    useEffect(() => {
        if (route.params?.isEditMode && route.params?.expense) {
            setIsEdit(true);
            const extractedExpense = route.params.expense;
            const paramDate = new Date(extractedExpense.date);

            setValue(extractedExpense.type.id);
            setAmount(`${extractedExpense.amount}`);
            setAdditionalInfo(extractedExpense.description);
            setSelectedTags(extractedExpense.tags.map((tag) => tag.id));
            setInputDate(paramDate);
            setValue(extractedExpense.type.id)
            setIsReceivingUser(!!extractedExpense.receiver)
            setTime({ hours: paramDate.getHours(), minutes: paramDate.getMinutes() });
        }
    }, [route.params?.isEditMode, route.params?.expense]);

    const maxFontSizeMultiplier = 1.5;
    let timeDate = new Date();
    time.hours !== undefined && timeDate.setHours(time.hours);
    time.minutes !== undefined && timeDate.setMinutes(time.minutes);

    // Handler for changing the selected expense type
    const handleExpenseTypeChange = (selectedExpenseType: string | null) => {
    };

    // New handler for changing the selected tags
    const handleTagChange = (tag: string | null) => {
        // Handle tag change logic if needed
    };

    const handleUserChange = (user: string | null) => {
        if (user) setSelectedUser(user);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setIsAmountHoldingLess(false); // Reset the isAmountHoldingLess state when the modal is closed
    };

    const submitExpense = async () => {
        try {
            setModalVisible(false);
            setIsLoading(true);
            const expenseDate = new Date(inputDate);
            expenseDate.setHours(time.hours, time.minutes);

            let newExpense: Expense ={
                date: expenseDate,
                type: { id: value } as ExpenseType,
                amount: parseFloat(amount),
                description: additionalInfo,
                sender: loggedInUser,
                receiver: selectedUser ? { id: selectedUser } as User : null,
                tags: selectedTags.map(tag => ({id: tag})) as Tags[]
            };
            if(isEdit)
                newExpense.id = route.params.expense.id;

            newExpense = await ExpenseService.addExpense(newExpense);

            newExpense.date = new Date(newExpense.date);

            setExpenses((prevExpenses) => [...prevExpenses.filter((expenseItem) => expenseItem.id !== newExpense.id), newExpense]);

            setAmount('');
            setValue(null);
            setAdditionalInfo('');
            setLoggedInUser((currVal: User) => {
                let amountHolding = currVal.amountHolding - parseFloat(amount);
                let amountToReceive = currVal.amountToReceive;
                if (amountHolding < 0) {
                    amountHolding = currVal.amountHolding;
                    amountToReceive = currVal.amountToReceive + parseFloat(amount);
                }
                return { ...currVal, amountHolding, amountToReceive };
            });

            navigation.goBack();
        } catch (err) {
            console.error('Error adding expense:', err);
            setError(err.response?.data ?? err.message ?? 'An error occurred while adding the expense');
        } finally {
            setIsLoading(false);
        }
    };

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
            const receivingUser = users.filter((user) => user.id === selectedUser)[0];
            if (parseFloat(amount) > receivingUser.amountToReceive) {
                setModalMessage(
                    `The amount to be received (${receivingUser.amountToReceive}) is smaller than the entered amount (${amount}). Do you wish to continue?`
                );
                setModalVisible(true);
                return;
            }
        }

        if (parseFloat(amount) > loggedInUser.amountHolding) {
            setModalMessage(
                `Amount holding is less. Please either declare contribution or this amount will be considered as a loan. You already have the loan of ${loggedInUser.amountToReceive},  Do you wish to continue?`
            );
            setIsAmountHoldingLess(true);
            setModalVisible(true);
            return;
        }

        submitExpense();
    };

    const navigateToManageAmounts = () => {
        setModalVisible(false);
        navigation.navigate('ProfileStack', { screen: 'ManageAmounts', params: { title: 'Manage Amounts' } });
    };

    // Component rendering
    return (
        <ScrollView contentContainerStyle={commonAddScreenStyles.scrollViewContainer}>
            <LoadingError error={error} isLoading={isLoading} />

            {/* Expense type selector */}
            <CustomDropDown
                items={expenseTypes}
                schema={{
                    label: 'name',
                    value: 'id',
                }}
                zIndex={3000}
                zIndexInverse={3000}
                searchable={true}
                open={open}
                setOpen={setOpen}
                containerStyle={{ height: 40, marginBottom: 16 }}
                value={value}
                setValue={setValue}
                itemSeparator={true}
                onChangeValue={handleExpenseTypeChange}
                testID="expense-type-picker"
            />

            {/* Additional selector for users if required */}
            {value && isReceivingUser && (
                <CustomDropDown
                    testID="user-picker"
                    schema={{
                        label: 'name',
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

            {/* New selector for tags */}
            {!isReceivingUser && ( // Add this condition
                <CustomDropDown
                    testID="tags-picker"
                    multiple={true}
                    items={tags}
                    zIndex={1000}
                    zIndexInverse={1000}
                    schema={{
                        label: 'name',
                        value: 'id',
                    }}
                    open={tagOpen}
                    setOpen={setTagOpen}
                    containerStyle={{ height: 40, marginBottom: 16 }}
                    value={selectedTags}
                    setValue={setSelectedTags}
                    itemSeparator={true}
                    placeholder="Select Tags"
                    onChangeValue={handleTagChange}
                />
            )}

            {/* Input fields for amount and additional information */}
            <NumberInput
                label="Amount"
                value={amount}
                onChangeText={setAmount}
            />

            <TextInput
                label="Additional information (optional)"
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                style={commonAddScreenStyles.inputField}
            />

            {/* Date picker */}
            <DatePickerInput
                locale="en"
                label="Expense date"
                value={inputDate}
                onChange={(d) => setInputDate(d || new Date())}
                inputMode="start"
                style={commonAddScreenStyles.inputField}
            />

            {/* Time picker */}
            <View style={[commonStyles.row, commonAddScreenStyles.marginVerticalEight]}>
                <View style={commonAddScreenStyles.section}>
                    <Text maxFontSizeMultiplier={maxFontSizeMultiplier} style={commonAddScreenStyles.bold}>
                        Time
                    </Text>
                    <Text maxFontSizeMultiplier={maxFontSizeMultiplier}>
                        {time && time.hours !== undefined && time.minutes !== undefined
                            ? timeFormatter.format(new Date().setHours(time.hours, time.minutes))
                            : `Current Time: ${timeFormatter.format(new Date())}`}
                    </Text>
                </View>
                <Button icon={'clock'} onPress={() => setTimeOpen(true)} mode="contained-tonal" title={'Pick time'} />
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
            <Button icon={route.params?.isEditMode ? 'update' : 'credit-card-plus'} mode="contained" onPress={handleAddExpense} title={route.params?.isEditMode ? 'Update Expense' : ' Add Expense'} />

            <Portal>
                <PaperModal visible={modalVisible} onDismiss={handleModalClose} contentContainerStyle={commonStyles.modalContainer}>
                    <Text>{modalMessage}</Text>
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="check" mode="contained" onPress={submitExpense} title={'Continue'} />
                    {isAmountHoldingLess && (
                        <>
                            <View style={commonStyles.modalButtonGap} />
                            <Button icon="account-cog" mode="contained" onPress={navigateToManageAmounts} title={"Manage Accounts"} />
                        </>
                    )}
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={handleModalClose} title={"Cancel"} />
                </PaperModal>
            </Portal>
        </ScrollView>
    );
};

export default AddExpenseScreen;
