// LoginScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl, androidClientId, expoClientId } from '../app-env.config';
import { useRecoilState } from 'recoil';
import { userState } from '../recoil/atom';

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
        setLoading(true); // Start loading
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
            setUserInfo(user);
            navigation.navigate('Home');
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setError(error.message);
            setUserInfo(null);
        } finally {
            setLoading(false); // End loading
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
                    <Button
                        title="Sign in with Google"
                        disabled={!request || loading} // Disable the button when loading
                        onPress={() => {
                            promptAsync();
                        }}
                    />
                    {loading && <ActivityIndicator />}
                    {error && <Text>{error}</Text>}
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
        marginRight: 10,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    button: {
        marginTop: 10,
    },
});

export default LoginScreen;
