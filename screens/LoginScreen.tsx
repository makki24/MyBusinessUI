// LoginScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl, androidClientId, expoClientId } from '../app-env.config';
import { useRecoilState } from 'recoil';
import { userState } from '../recoil/atom';
import {Text} from 'react-native-paper'
import Button from "../components/common/Button";
import LoadingError from "../components/common/LoadingError";
import {MAIN_PROFILE_PIC, UI_ELEMENTS_GAP} from "../src/styles/constants";

const LoginScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useRecoilState(userState);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // New loading state
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId,
        expoClientId,
    });

    useEffect(() => {
        if (response?.type === 'success') {
            loginOrSignUp(response.authentication.accessToken);
        }
    }, [response]);

    useEffect(() => {
        const checkUser = async () => {
            const token = await AsyncStorage.getItem('@token');
            if (token) {
                login(token);
            }
        };
        checkUser();
    }, []);

    const loginFunc = async (token, url: string) => {
        if (!token) return;
        setLoading(true); // Start loading
        try {
            const response = await fetch(`${apiUrl}/${url}`, {
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
            if (url === 'loginOrSignUp')
                saveToken(response)
            setUserInfo(user);
            navigation.navigate('Home');
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setUserInfo(null);
            throw new Error(error.message);
        } finally {
            setLoading(false); // End loading
        }
    }

    const saveToken = (response) => {
        const authHeader = response.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.slice(7); // Remove 'Bearer ' prefix
            console.log('Bearer token:', token);
            AsyncStorage.setItem('@token', token);
        } else {
            console.log('No Bearer token found in headers');
        }
    }

    const loginOrSignUp = async (token) => {
        try {
            await loginFunc(token, 'loginOrSignUp')
        } catch (error) {
            setError(error.message);
        }
    };

    const login = async (token) => {
        try {
            await loginFunc(token, 'login')
        } catch (error) {
            setError(error.message);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('@token');
        setUserInfo(null);
    };

    return (
        <View style={styles.container}>
            {!userInfo ? (
                <View>
                    <LoadingError error={error} isLoading={loading} />
                    <Button
                        title="Sign in with Google"
                        icon={'google'}
                        disabled={!request || loading} // Disable the button when loading
                        onPress={() => {
                            promptAsync();
                        }}
                    />
                </View>
            ) : (
                <View style={styles.loggedInContainer}>
                    <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.profileImageContainer}>
                        <Image source={{ uri: userInfo?.picture || 'placeholder_image_url' }} style={styles.profileImage} />
                    </TouchableOpacity>
                    <View>
                        <Text>Email: {userInfo.email}</Text>
                        <Text>Name: {userInfo.name}</Text>
                        <View style={styles.button}>
                            <Button title="Continue to Home" onPress={() => navigation.navigate('Home')} />
                        </View>
                        <View style={styles.button}>
                            <Button title="Logout" onPress={logout} />
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loggedInContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImageContainer: {
        marginRight: UI_ELEMENTS_GAP,
    },
    profileImage: {
        width: MAIN_PROFILE_PIC,
        height: MAIN_PROFILE_PIC,
        borderRadius: MAIN_PROFILE_PIC / 2,
    },
    button: {
        marginTop: UI_ELEMENTS_GAP,
    },
});

export default LoginScreen;
