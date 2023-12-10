import React, { useState } from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {Button, TextInput, Text, IconButton} from 'react-native-paper';
import {useRecoilState} from "recoil";
import {userState} from "../recoil/atom";
import userService from "../services/UserService";

const ManageAmountsScreen = ({ navigation }) => {
    const [amountToAdd, setAmountToAdd] = useState('');
    const [amountToTransfer, setAmountToTransfer] = useState('');
    const [loggedInUser, setLoggedInUser] = useRecoilState(userState);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddAmount = async () => {
        try {
            setIsLoading(true);
            const updatedUser = {...loggedInUser, amountHolding: loggedInUser.amountHolding + parseFloat(amountToAdd)};
            const response = await userService.updateContribution(updatedUser)
            setLoggedInUser(response);
            setAmountToAdd('');
        } catch (error) {
            setError(error.response?.data ?? 'An error occurred while updating the amount');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTransferAmount = async () => {
        if (parseFloat(amountToTransfer) > loggedInUser.amountToReceive && parseFloat(amountToTransfer) > loggedInUser.amountHolding) {
            setError('The transfer amount cannot be greater than the amount to receive.');
        } else {
            try {
                setIsLoading(true)
                const updatedUser = {...loggedInUser, amountToReceive: loggedInUser.amountToReceive - parseFloat(amountToTransfer)};
                const response = await userService.updateLoan(updatedUser)
                setLoggedInUser(response);
                setAmountToTransfer('');
                setError('');
            } catch (error) {
                setError(error.response?.data ?? 'An error occurred while updating the amount');
            }finally {
                setIsLoading(false)
            }
        }
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
            <TextInput
                label="Amount to Add"
                value={amountToAdd}
                onChangeText={setAmountToAdd}
                style={styles.input}
            />
            <Button icon="plus" mode="contained" onPress={handleAddAmount} style={styles.button}>
                Declare the contribution
            </Button>
            <TextInput
                label="Amount to Transfer"
                value={amountToTransfer}
                onChangeText={setAmountToTransfer}
                style={styles.input}
            />
            <Button icon="arrow-right" mode="contained" onPress={handleTransferAmount} style={styles.button}>
                Transfer to clear loan
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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

export default ManageAmountsScreen;
