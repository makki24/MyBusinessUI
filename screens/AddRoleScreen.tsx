// src/screens/AddRoleScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRecoilState } from 'recoil';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import RolesService from "../services/RolesService";
import { rolesState } from '../recoil/atom'; // Adjust the path accordingly
import { Role } from '../types';

interface AddRoleScreenProps {
    navigation: any; // Adjust the type based on your navigation prop type
}

const AddRoleScreen: React.FC<AddRoleScreenProps> = ({ navigation }) => {
    const [roleName, setRoleName] = useState('');
    const [roles, setRoles] = useRecoilState(rolesState);

    const handleAddRole = async () => {
        try {
            // Call your API service to add a new role
            const newRole = await RolesService.addRole({ roleName });

            // Update Recoil state with the new role
            setRoles((prevRoles) => [...prevRoles, newRole]);

            // Navigate back to the Roles screen
            navigation.goBack();
        } catch (error) {
            console.error('Error adding role:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Input
                placeholder="Enter role name"
                value={roleName}
                onChangeText={setRoleName}
            />
            <Button title="Add Role" onPress={handleAddRole} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
});

export default AddRoleScreen;