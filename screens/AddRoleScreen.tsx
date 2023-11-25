// src/screens/AddRoleScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
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
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddRole = async () => {
        try {
            setIsLoading(true); // Set loading to true

            // Call your API service to add a new role
            const newRole = await RolesService.addRole({ roleName });

            // Update Recoil state with the new role
            setRoles((prevRoles) => [...prevRoles, newRole]);

            // Navigate back to the Roles screen
            navigation.goBack();
        } catch (error) {
            console.error('Error adding role:', error);
            setError(error.response.data); // Set the error message
        } finally {
            setIsLoading(false); // Set loading to false regardless of success or failure
        }
    };

    return (
        <View style={styles.container}>
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Text>
                        <ActivityIndicator size="large" color="#0000ff" /> {/* Show spinner if loading */}
                    </Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

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

export default AddRoleScreen;