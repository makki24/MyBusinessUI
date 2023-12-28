// AddUserScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, Text, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { Button, TextInput, Avatar, Snackbar } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons';
import EmailInput from '../components/common/EmailInput';
import PhoneNumberInput from '../components/common/PhoneNumberInput';
import * as ImagePicker from 'expo-image-picker';
import uploadImgtoImgBB from '../src/util/UploadImgtoImgBB';
import userService from '../services/UserService';
import { User } from '../types';
import {DEFAULT_AVATAR_URL} from "../constants/mybusiness.constants";


const AddUserScreen = ({ route, navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [picture, setPicture] = useState(null);
    const [amountToReceive, setAmountToReceive] = useState('');
    const [amountHolding, setAmountHolding] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pictureUrl, setPictureUrl] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [emailValid, setEmailValid] = useState(true);

    const onSnackbarDismiss = () => {
        setSnackbarVisible(false);
    };

    useEffect(() => {
        // Check if the screen is in edit mode and user data is provided
        if (route.params?.isEditMode && route.params?.user) {
            const editingUser = route.params.user as User;
            setUsername(editingUser.username);
            setEmail(editingUser.email);
            setPicture(editingUser.picture);
            setAmountToReceive(`${editingUser.amountToReceive}`);
            setAmountHolding(`${editingUser.amountHolding}`);
            setPhoneNumber(editingUser.phoneNumber);
        }
    }, [route.params?.isEditMode, route.params?.user]);

    const handleAddUser = async () => {
        setIsLoading(true);
        setError('');
        try {
            if (!username || !phoneNumber) {
                throw new Error('Username and Phone Number are mandatory fields.');
            }

            if (!emailValid) {
                throw new Error('Email is not valid');
            }

            let imageUrl;
            if (picture) {
                imageUrl = await uploadImgtoImgBB(picture);
                setPictureUrl(imageUrl);
            }

            // Add your logic to add/update the user here

            let user: User = {
                username,
                email,
                picture: imageUrl,
                phoneNumber,
                roles: [],
                amountHolding: parseFloat(amountHolding),
                amountToReceive: parseFloat(amountToReceive),
            };

            if (route.params?.isEditMode && route.params?.user) {
                // If in edit mode, update the existing user
                user.id = route.params.user.id;
            }
            user = await userService.addUser(user);

            setSnackbarVisible(true);
        } catch (error) {
            console.log(error);
            setError(error?.message ?? 'Error adding/updating user. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setPicture(result.assets[0].uri);
        }
    };

    const CustomRoundImage = ({ source, style, children }) => {
        return (
            <TouchableOpacity onPress={pickImage} style={[style, { borderRadius: style.width / 2, overflow: 'hidden' }]}>
                <ImageBackground source={source} style={style}>
                    {children}
                </ImageBackground>
            </TouchableOpacity>
        );
    };

    const renderImageOverlay = () => (
        <View style={styles.editIcon}>
            <AntDesign name={picture ? 'edit' : 'upload'} size={24} color="white" />
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <View style={styles.imageContainer}>
                <CustomRoundImage source={{ uri: picture || DEFAULT_AVATAR_URL }} style={styles.roundedImage}>
                    {renderImageOverlay()}
                </CustomRoundImage>
            </View>

            <TextInput label="Username*" value={username} onChangeText={setUsername} style={styles.inputField} />
            <EmailInput
                style={styles.inputField}
                label="Email"
                setEmail={setEmail}
                onValidationChange={setEmailValid}
                email={email}
            />
            <PhoneNumberInput label="Phone Number*" phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} style={styles.inputField}
            />
            <TextInput
                label="Amount to Receive"
                value={amountToReceive}
                onChangeText={setAmountToReceive}
                keyboardType="numeric"
                style={styles.inputField}
            />
            <TextInput
                label="Amount Holding"
                value={amountHolding}
                onChangeText={setAmountHolding}
                keyboardType="numeric"
                style={styles.inputField}
            />
            <Button mode="contained" onPress={handleAddUser}>
                {route.params?.isEditMode ? 'Update User' : 'Add User'}
            </Button>
            <Snackbar visible={snackbarVisible} onDismiss={onSnackbarDismiss} duration={3000}>
                {`User ${route.params?.isEditMode ? 'updated' : 'added'} successfully`}
            </Snackbar>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContainer: {
        justifyContent: 'center',
        padding: 16,
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
    inputField: {
        marginBottom: 8,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
    },

    roundedImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden', // Ensure content is clipped to the rounded shape
        marginBottom: 8,
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        backgroundColor: 'black',
        borderRadius: 12,
        padding: 4,
        alignItems: 'center',
    },
    uploadText: {
        color: 'white',
        marginTop: 4,
    },
});

export default AddUserScreen;