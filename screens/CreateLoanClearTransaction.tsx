import React, {useEffect, useState} from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import {Button, TextInput, Text, Snackbar} from 'react-native-paper';
import { useRecoilState } from "recoil";
import {loanToHoldingTransactionState, usersState, userState} from "../recoil/atom";
import CustomDropDown from "../components/common/CustomDropdown";
import UserDropDownItem from "../components/common/UserDropDownItem";
import {LoanToHoldingTransaction, User} from "../types";
import contributionService from "../services/ContributionService";

const CreateLoanClearTransaction = ({ navigation, route }) => {
    const [amountToTransfer, setAmountToTransfer] = useState('');
    const [loggedInUser, setLoggedInUser] = useRecoilState(userState);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [allUsers, setAllUsers] = useRecoilState(usersState);
    const [userOpen, setUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [displayUser, setDisplayUser] = useState<User>(loggedInUser);
    const [loanTransactions, setLoanTransactions] = useRecoilState(loanToHoldingTransactionState);
    const [snackbarVisible, setSnackbarVisible] = useState(false);

    useEffect(() => {
        const userToDisplay = selectedUser ? allUsers.find(user => user.id === selectedUser) : loggedInUser;
        setDisplayUser(userToDisplay);
    }, [selectedUser]);

    useEffect(() => {
        if (route.params?.isEditMode && route.params?.transaction) {
            const selectedTransaction: LoanToHoldingTransaction = route.params.transaction;
            setAmountToTransfer(`${selectedTransaction.amount}`);
            setSelectedUser(selectedTransaction.user.id);
        }
    }, [route.params?.isEditMode, route.params?.transaction]);


    const submitTransfer = async () => {
        setError('');
        try {
            setIsLoading(true);
            const transaction: LoanToHoldingTransaction = {
                createdBy: loggedInUser,
                user: selectedUser ?  {id: selectedUser} as User : loggedInUser,
                date: new Date(),
                amount: parseFloat(amountToTransfer)
            }
            if (route.params?.isEditMode && route.params?.transaction) {
                transaction.id = route.params.transaction.id;
            }
            const response = await contributionService.createOrUpdateLoanTransactions(transaction);
            transaction.id = response.id;
            setLoanTransactions((prevTransactions) => [...prevTransactions.filter((prevTransaction) => prevTransaction.id !== transaction.id), transaction]);
            //set logged in user


            setAmountToTransfer('');
            setSnackbarVisible(true);
        } catch (error) {
            setError(error.message ?? 'An error occurred while updating the amount');
        } finally {
            setIsLoading(false);
        }
    }

    const handleTransferAmount = async () => {
        if (parseFloat(amountToTransfer) > loggedInUser.amountToReceive && parseFloat(amountToTransfer) > loggedInUser.amountHolding) {
            setError('The transfer amount cannot be greater than the amount to receive or amount holding.');
            return;
        }
        submitTransfer();
    };

    return (
        <View  style={styles.viewContainer}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
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


            <CustomDropDown
                schema={{
                    label: 'username',
                    value: 'id',
                }}
                zIndex={2000}
                zIndexInverse={2000}
                items={allUsers.filter(user => (user.phoneNumber || user.email))}
                searchable={true}
                open={userOpen}
                setOpen={setUserOpen}
                containerStyle={{ height: 40, marginBottom: 16 }}
                value={selectedUser}
                setValue={setSelectedUser}
                itemSeparator={true}
                placeholder="Select User"
                renderListItem={({ item }) => (
                    <UserDropDownItem item={item} setSelectedUser={setSelectedUser} selectedUser={selectedUser} setUserOpen={setUserOpen} />
                )}
            />

            <Text>Amount to Receive: {displayUser.amountToReceive}</Text>
            <Text style={{marginBottom: 5}}>Amount Holding: {displayUser.amountHolding}</Text>


            <TextInput
                label="Amount to Transfer"
                value={amountToTransfer}
                onChangeText={setAmountToTransfer}
                style={styles.input}
                keyboardType={'numeric'}
            />

            <Button icon="arrow-right" mode="contained" onPress={handleTransferAmount} style={styles.button}>
                Transfer to clear loan
            </Button>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                action={{
                    label: 'OK',
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                Transaction created successfully!
            </Snackbar>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    viewContainer: {
        flex: 1, // Ensure the container takes the full screen height
        justifyContent: 'center',
        padding: 16,
    },
    scrollViewContent: {
        flexGrow: 1, // Allow the content to grow within the ScrollView
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginBottom: 16,
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
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});

export default CreateLoanClearTransaction;
