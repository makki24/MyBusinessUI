import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Divider, TextInput, Text,  Button, IconButton, Snackbar, ActivityIndicator, List } from 'react-native-paper';
import RolesService from "../services/RolesService";
import { User } from "../types";
import UserService from "../services/UserService";
import DropDownPicker from 'react-native-dropdown-picker';
import CustomDropDown from "../components/common/CustomDropdown";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import {DROPDOWN_HEIGHT, HEADING_SIZE, UI_ELEMENTS_GAP} from "../src/styles/constants";

const EditRoleScreen = ({ route }) => {
    const { role } = route.params;
    const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarRemoveVisible, setSnackbarRemoveVisible] = useState(false);
    const [loadingAssignedUsers, setLoadingAssignedUsers] = useState(true);
    const [loadingAllUsers, setLoadingAllUsers] = useState(true);
    const [errorAssignedUsers, setErrorAssignedUsers] = useState(null);
    const [errorAllUsers, setErrorAllUsers] = useState(null);

    useEffect(() => {
        const fetchAssignedUsers = async () => {
            try {
                const assignedUsersData = await RolesService.getUsersAssigned(role.id);
                setAssignedUsers(assignedUsersData);
            } catch (error) {
                console.error('Error fetching assigned users:', error.response?.data || 'Unknown error');
                setErrorAssignedUsers(error.response?.data ?? 'Error fetching assigned users. Please try again.');
            } finally {
                setLoadingAssignedUsers(false);
            }
        };

        fetchAssignedUsers();
    }, []);

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const users = await UserService.getUsers();
                setAllUsers(users.filter(user => user.email && !assignedUsers.find(assignedUser => assignedUser.email === user.email)));
            } catch (error) {
                console.error('Error fetching all users:', error.response?.data || 'Unknown error');
                setErrorAllUsers(error.response?.data ?? 'Error fetching all users. Please try again.');
            } finally {
                setLoadingAllUsers(false);
            }
        };

        fetchAllUsers();
    }, [assignedUsers]);

    const handleAddUser = async () => {
        if (value) {
            const selectedUser = allUsers.find(user => user.email === value);
            try {
                if (selectedUser) {
                    setLoadingAllUsers(true);
                    await UserService.assignUserToRole(selectedUser.id, role.id);
                    setAssignedUsers(prevUsers => [...prevUsers, selectedUser]);
                    setValue(null);
                    setSnackbarVisible(true);
                }
            } catch (error) {
                console.error(error.response?.data ?? 'Error assigning user to role:', error);
                setErrorAllUsers(error.response?.data ?? 'Error assigning user to role. Please try again.');
            } finally {
                setLoadingAllUsers(false);
            }
        }
    };

    const onSnackbarRemoveDismiss = () => {
        setSnackbarRemoveVisible(false);
    };

    const handleRemoveUser = async (userId) => {
        try {
            setLoadingAssignedUsers(true);
            await UserService.removeUserRole(userId, role.id);
            setAssignedUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            setSnackbarRemoveVisible(true);
        } catch (error) {
            console.error(error.response?.data.error ?? 'Error removing user from role:', error);

            // Update the state with the error information
            setErrorAssignedUsers(error.response?.data.error ?? error.response?.data ?? 'Error removing user from role. Please try again.');
        } finally {
            setLoadingAssignedUsers(false);
        }
    };

    const onSnackbarDismiss = () => {
        setSnackbarVisible(false);
    };

    const renderUserItem = ({ item }) => (
        <List.Item
            title={item.name}
            right={() => (
                <IconButton icon="delete" onPress={() => handleRemoveUser(item.id)} />
            )}
        />
    );

    return (
        <View style={commonStyles.container}>
            <LoadingError error={errorAllUsers} isLoading={loadingAllUsers} />

            <Text style={styles.roleHeading}>{role.name}</Text>

            <CustomDropDown
                items={allUsers}
                schema={{
                    label: 'name',
                    value: 'email',
                }}
                searchable={true}
                open={open}
                setOpen={setOpen}
                containerStyle={{ height: DROPDOWN_HEIGHT, marginBottom: UI_ELEMENTS_GAP * 2 }}
                value={value}
                setValue={setValue}
                itemSeparator={true}
            />

            <Button
                icon={({ size, color }) => (
                    <IconButton icon="plus" iconColor={color} size={size} />
                )}
                mode="contained"
                onPress={handleAddUser}
                style={{ marginBottom: UI_ELEMENTS_GAP }}
            >
                Add
            </Button>


            <LoadingError error={errorAssignedUsers} isLoading={loadingAssignedUsers} />

            <FlatList
                data={assignedUsers}
                renderItem={renderUserItem}
                keyExtractor={(item: User) => item.email?.toString()}
                ItemSeparatorComponent={() => <Divider />}
            />

            <Snackbar
                visible={snackbarVisible}
                onDismiss={onSnackbarDismiss}
                duration={3000}
            >
                {`User "${assignedUsers[assignedUsers.length - 1]?.name}" added successfully`}
            </Snackbar>

            <Snackbar
                visible={snackbarRemoveVisible}
                onDismiss={onSnackbarRemoveDismiss}
                duration={3000}
            >
                {`User removed successfully`}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    roleHeading: {
        fontSize: HEADING_SIZE,
        fontWeight: 'bold',
        marginBottom: UI_ELEMENTS_GAP,
    },
});

export default EditRoleScreen;
