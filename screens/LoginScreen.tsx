// LoginScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiUrl,androidClientId, expoClientId} from  '../app-env.config';

const LoginScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId,expoClientId
    });

    useEffect(() => {
        if (response?.type === 'success') {
            AsyncStorage.setItem('@token', response.authentication.accessToken);
            getUserInfo(response.authentication.accessToken);
        }
    }, [response]);

    useEffect(() => {
        const checkUser = async () => {
            const token = await AsyncStorage.getItem('@token');
            if (token) {
                getUserInfo(token);
            }
        };
        checkUser();
    }, []);

    const getUserInfo = async (token) => {
        if (!token) return;
        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                console.log(response);
                throw new Error('Token is invalid or expired');
            }
            const user = await response.json();
            await AsyncStorage.setItem('@user', JSON.stringify(user));
            setUserInfo(user);
            navigation.navigate('Home');
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setError(error.message);
            AsyncStorage.removeItem('@token');
            setUserInfo(null);
        }
    };

    return (
        <View>
            {!userInfo ? (
                <View>
                    <Button
                        title="Sign in with Google"
                        disabled={!request}
                        onPress={() => {
                            promptAsync();
                        }}
                    />
                    {error && <Text>{error}</Text>}
                </View>
            ) : (
                <View>
                    <Text>Email: {userInfo.email}</Text>
                    <Text>Name: {userInfo.name}</Text>
                    <Button
                        title="Continue to Home"
                        onPress={() => navigation.navigate('Home')}
                    />
                </View>
            )}
        </View>
    );
};

export default LoginScreen;
