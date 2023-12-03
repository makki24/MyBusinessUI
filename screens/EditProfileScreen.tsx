// EditProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';

const EditProfileScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={styles.inputContainer}>
                <TextInput style={styles.input} placeholder="Full Name" />
                <TextInput style={styles.input} placeholder="Email" />
                {/* Add other profile fields as needed */}
            </View>
            <Button title="Save" onPress={() => { /* Handle save functionality */ }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 8,
        paddingHorizontal: 8,
    },
});

export default EditProfileScreen;
