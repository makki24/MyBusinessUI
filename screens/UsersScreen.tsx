import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { FAB, Text, Button, Modal, Portal, Snackbar } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import UserService from '../services/UserService';
import UserItem from '../components/UserItem';
import { usersState } from '../recoil/atom';
import { User } from '../types';
import commonScreenStyles from "../components/common/commonScreenStyles";
import commonStyles from "../components/common/commonStyles";

const UsersScreen = ({ navigation }) => {
    const [users, setUsers] = useRecoilState(usersState);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [members, setMembers] = useState<User[]>([]);

    const fetchUsers = async () => {
        try {
            setIsRefreshing(true);
            let usersData = await UserService.getUsers();
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error.message || 'Unknown error');
            setError(error.message || 'Error fetching users. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        setMembers(users);
    }, [users]);

    const handleEditUser = (user: User) => {
        if (user.roles.findIndex(role => role.roleName === 'MEMBER') === -1) {
            return ;
        }
        navigation.navigate('UsersStack', {
            screen: 'AddUser',
            params: { title: `Edit User: ${user.username}`, user, isEditMode: true },
        });
    };

    const handleDeleteUser = async (user) => {
        setSelectedUser(user);
        setIsLoading(true);

        try {
            setIsDeleteModalVisible(true);
        } catch (error) {
            console.error('Error checking user details:', error.response?.data || 'Unknown error');
            setError(error.response?.data || 'Error checking user details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToTransactions = (clickedUser: User) => {
        navigation.navigate('UsersStack', {
            screen: 'UserReport',
            params: { title: `User Report`, userId: clickedUser.id,},
        });
    }

    const confirmDeleteUser = async () => {
        setIsLoading(true);

        try {
            await UserService.deleteUser(selectedUser.id);
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== selectedUser.id));
            setSnackbarVisible(true); // Show Snackbar on successful deletion
        } catch (error) {
            console.error('Error deleting user:', error.response?.data || 'Unknown error');
            setError(error.message || 'Error deleting user. Please try again.');
        } finally {
            setIsLoading(false);
            setSelectedUser(null);
            setIsDeleteModalVisible(false);
        }
    };

    const handleRefresh = () => {
        fetchUsers();
    };

    const onSnackbarDismiss = () => {
        setSnackbarVisible(false);
    };

    return (
        <View style={commonStyles.container}>
            {error && (
                <View style={commonStyles.errorContainer}>
                    <Text style={commonStyles.errorText}>{error}</Text>
                </View>
            )}

            {isLoading && (
                <View style={commonStyles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}

            {!error && (
                <FlatList
                    data={members}
                    renderItem={({ item }) => (
                        <UserItem user={item} onPress={() => navigateToTransactions(item)} onEdit={() => handleEditUser(item)} onDelete={() => handleDeleteUser(item)} />
                    )}
                    keyExtractor={(item) => item.id.toString()} // Ensure key is a string
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                />
            )}

            <FAB
                style={commonScreenStyles.fab}
                icon="plus"
                onPress={() => navigation.navigate('UsersStack', { screen: 'AddUser', params: { title: 'Add User' } })}
            />

            {/* Delete User Modal */}
            <Portal>
                <Modal visible={isDeleteModalVisible} onDismiss={() => setIsDeleteModalVisible(false)} contentContainerStyle={commonStyles.modalContainer}>
                    <Text>Are you sure you want to delete this user?</Text>
                    <View style={commonStyles.modalButtonGap} />
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={() => setIsDeleteModalVisible(false)}>
                        Cancel
                    </Button>
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="delete" mode="contained" onPress={confirmDeleteUser}>
                        Delete
                    </Button>
                </Modal>
            </Portal>

            {/* Snackbar for successful deletion */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={onSnackbarDismiss}
                duration={3000}
            >
                {`User deleted successfully`}
            </Snackbar>
        </View>
    );
};

export default UsersScreen;
