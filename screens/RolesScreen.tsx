// src/screens/RolesScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Card, Title, FAB } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import { rolesState } from '../recoil/atom'; // Adjust the path accordingly
import RolesService from "../services/RolesService";
import { Role } from '../types';

const RolesScreen = ({ navigation }) => {
    const [roles, setRoles] = useRecoilState(rolesState);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesData = await RolesService.getRoles();
                setRoles(rolesData);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };

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

    return (
        <View style={styles.container}>
            <FlatList
                data={roles}
                renderItem={renderRoleItem}
                keyExtractor={(item) => item.id}
            />

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
});

export default RolesScreen;

