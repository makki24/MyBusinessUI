// AddContributionScreen.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { useRecoilState } from "recoil";
import { tagsState, usersState, userState } from "../recoil/atom";
import userService from "../services/UserService";
import UserDropDownItem from "../components/common/UserDropDownItem";
import CustomDropDown from "../components/common/CustomDropdown";
import DateTimePicker from "../components/common/DateTimePicker";
import { Contribution, Tag, User } from "../types";

let oldAmount = 0;
const AddContributionScreen = ({ navigation, route }) => {
    const [amountToAdd, setAmountToAdd] = useState('');
    const [loggedInUser, setLoggedInUser] = useRecoilState(userState);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [allUsers, setAllUsers] = useRecoilState(usersState);
    const [userOpen, setUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [inputDate, setInputDate] = useState(new Date());
    const [time, setTime] = useState({
        hours: new Date().getHours(),
        minutes: new Date().getMinutes(),
    });
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [tagOpen, setTagOpen] = useState(false);
    const [tags, setTags] = useRecoilState(tagsState);

    useEffect(() => {
        if (route.params?.isEditMode && route.params?.contribution) {
            const extractedContribution = route.params.contribution;
            const paramDate = new Date(extractedContribution.date);

            setAmountToAdd(`${extractedContribution.amount}`);
            oldAmount = extractedContribution.amount;
            setSelectedUser(extractedContribution.sendingMember?.id || null);
            setInputDate(paramDate);
            setTime({ hours: paramDate.getHours(), minutes: paramDate.getMinutes() });
            setSelectedTags(extractedContribution.tags.map(tag => tag.id));
        }
    }, [route.params?.isEditMode, route.params?.contribution]);

    const handleAddAmount = async () => {
        setError('');
        try {
            setIsLoading(true);
            const contributionDate = new Date(inputDate);
            contributionDate.setHours(time.hours, time.minutes);
            const contribution: Contribution = {
                sendingMember: selectedUser ? { id: selectedUser } as User : null,
                amount: parseFloat(amountToAdd),
                date: contributionDate,
                receivingManager: loggedInUser,
                tags: selectedTags.map(tag => ({ id: tag })) as Tag[],
            };
            let newAmount = loggedInUser.amountHolding + contribution.amount;

            if (route.params?.isEditMode && route.params?.contribution) {
                contribution.id = route.params.contribution.id;
                newAmount = newAmount - oldAmount;
            }

            const response = await userService.updateContribution(contribution);
            setLoggedInUser(user => ({
                ...user,
                amountHolding: newAmount
            }));
            setAmountToAdd('');
            navigation.goBack();
        } catch (error) {
            setError(error.message ?? 'An error occurred while updating the amount');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
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
                items={allUsers.filter(user => (user.phoneNumber || user.email) && user.email !== loggedInUser.email)}
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

            <CustomDropDown
                multiple={true}
                items={tags}
                zIndex={1000}
                zIndexInverse={1000}
                schema={{
                    label: 'tagName',
                    value: 'id',
                }}
                open={tagOpen}
                setOpen={setTagOpen}
                containerStyle={{ height: 40, marginBottom: 16 }}
                value={selectedTags}
                setValue={setSelectedTags}
                itemSeparator={true}
                placeholder="Select Tags"
            />

            <TextInput
                label="Amount to Add"
                value={amountToAdd}
                onChangeText={setAmountToAdd}
                style={styles.input}
            />

            <DateTimePicker
                label="Date"
                dateValue={inputDate}
                onDateChange={setInputDate}
                onTimeChange={setTime}
                timeValue={time}
            />

            <Button icon="plus" mode="contained" onPress={handleAddAmount} style={styles.button}>
                {route.params?.isEditMode ? 'Update Contribution' : 'Declare the contribution'}
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContainer: {
        justifyContent: 'center',
        padding: 16,
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

export default AddContributionScreen;
