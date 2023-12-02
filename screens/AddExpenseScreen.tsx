import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useRecoilState, useRecoilValue } from 'recoil';
import DropDownPicker from 'react-native-dropdown-picker';
import { Button, TextInput } from 'react-native-paper';
import { DatePickerInput, TimePickerModal } from 'react-native-paper-dates';

import { expenseTypesState, userState } from '../recoil/atom';
import ExpenseService from '../services/ExpenseService';
import ExpenseTypesService from '../services/ExpenseTypesService';

interface AddExpenseScreenProps {
    navigation: any;
}

DropDownPicker.setListMode('SCROLLVIEW');

const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({ navigation }) => {
    const [expenseTypes, setExpenseTypes] = useRecoilState(expenseTypesState);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [inputDate, setInputDate] = useState(new Date());
    const [time, setTime] = useState<{ hours: number | undefined; minutes: number | undefined }>({
        hours: new Date().getHours(),
        minutes: new Date().getMinutes(),
    });
    const [timeOpen, setTimeOpen] = useState(false);

    const user = useRecoilValue(userState);

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

    const handleAddExpense = async () => {
        try {
            if (!value || !amount) {
                setError('Expense type and amount are required');
                return;
            }

            if (value === 'others' && !additionalInfo) {
                setError('Additional info is required for others expenses');
                return;
            }

            setIsLoading(true);

            const selectedExpenseType = expenseTypes.find((type) => type.expenseTypeName === value);

            if (!selectedExpenseType) {
                setError('Invalid expense type selected');
                return;
            }

            const expenseDate = new Date(inputDate);
            expenseDate.setHours(time.hours, time.minutes);

            const newExpense = await ExpenseService.addExpense({
                date: expenseDate,
                expenseType: selectedExpenseType,
                amount: parseFloat(amount),
                additionalInfo,
                user, // Adding user property
            });

            console.log('New Expense:', newExpense);

            setAmount('');
            setValue(null);
            setAdditionalInfo('');

            navigation.goBack();
        } catch (error) {
            console.error('Error adding expense:', error.response);
            setError(error.response?.data ?? 'An error occurred while adding the expense');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <DropDownPicker
                items={expenseTypes.map((type) => ({ label: type.expenseTypeName, value: type.expenseTypeName }))}
                searchable={true}
                open={open}
                setOpen={setOpen}
                containerStyle={{ height: 40, marginBottom: 16 }}
                value={value}
                setValue={setValue}
                itemSeparator={true}
            />

            <TextInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.inputField} />

            <TextInput
                label="Additional information (optional)"
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                style={styles.inputField}
            />

            <DatePickerInput
                locale="en"
                label="Expense date"
                value={inputDate}
                onChange={(d) => setInputDate(d || new Date())}
                inputMode="start"
                style={styles.inputField}
            />

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

            <TimePickerModal
                locale={'en'}
                visible={timeOpen}
                onDismiss={onDismissTime}
                onConfirm={onConfirmTime}
                hours={time.hours}
                minutes={time.minutes}
            />
            <Button mode="contained" onPress={handleAddExpense}>
                Add Expense
            </Button>
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
});

export default AddExpenseScreen;
