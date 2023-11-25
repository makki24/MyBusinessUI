// src/screens/RolesScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, Title, FAB } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import { rolesState } from '../recoil/atom'; // Adjust the path accordingly
import RolesService from "../services/RolesService";
import { Role } from '../types';

const RolesScreen = ({ navigation }) => {
    const [roles, setRoles] = useRecoilState(rolesState);
    const [error, setError] = useState<string | null>(null); // State to track errors
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchRoles = async () => {
        try {
            setIsRefreshing(true); // Set refreshing to true

            const rolesData = await RolesService.getRoles();
            setRoles(rolesData);
        } catch (error) {
            console.error('Error fetching roles:', error);
            setError('Error fetching roles. Please try again.'); // Set the error message
        } finally {
            setIsRefreshing(false); // Set refreshing to false regardless of success or failure
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const renderRoleItem = ({ item }: { item: Role }) => (
        <Card style={styles.roleCard}>
            <Card.Content>
                <Title>{item.roleName}</Title>
            </Card.Content>
            <Card.Actions>
                <TouchableOpacity onPress={() => handleEditRole(item)}>
                    <Text>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteRole(item)}>
                    <Text>Delete</Text>
                </TouchableOpacity>
            </Card.Actions>
        </Card>
    );

    const handleAddRole = () => {
        navigation.navigate('AddRole');
    };

    const handleEditRole = (role: Role) => {
        // Navigate to the screen where you edit the selected role
        // You can use navigation.navigate('EditRole', { role }) and pass necessary props
    };

    const handleDeleteRole = (role: Role) => {
        // Assuming RolesService.deleteRole is an async function
    };

    const handleRefresh = () => {
        // Refresh roles on pull-to-refresh
        fetchRoles();
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
                    <ActivityIndicator size="large" color="#0000ff" /> {/* Show spinner if loading */}
                </View>
            )}

            {!error && (
                <FlatList
                    data={roles}
                    renderItem={renderRoleItem}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                        />
                    }
                />
            )}

            <FAB
                style={styles.fab}
                icon="plus"
                onPress={handleAddRole}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    roleCard: {
        marginBottom: 16,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
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

export default RolesScreen;
