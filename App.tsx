import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button, Image, ToastAndroid, TextInput } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import crashlytics from '@react-native-firebase/crashlytics';
import {url,androidClientId, expoClientId} from './app-env.config'

export default function App() {
  const apiUrl = url;

  const [userInfo, setUserInfo] = useState(null);
  const [helloMessage, setHelloMessage] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [getResponse, setGetResponse] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,expoClientId
  });

  useEffect(() => {
    fetch(`${apiUrl}/hello`)
        .then(response => response.text())
        .then(data => setHelloMessage(data))
        .catch(error => setHelloMessage(`Error: ${error.message}`));
  }, []);

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'GET', // Ensure that the method is a valid HTTP method like GET, POST, PUT, DELETE, etc.
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (err) {
      // Handle error
      console.log('after connecting', err);
      console.log("Failed to fetch user data " + err ? JSON.stringify(err) : '' );
      crashlytics().recordError(err);
      ToastAndroid.show("Failed to fetch user data " + err ? JSON.stringify(err) : '' , ToastAndroid.LONG);
      ToastAndroid.show(err.message, ToastAndroid.LONG);
    }
  };

  useEffect(() => {
    if (response?.type === "success") {
      getUserInfo(response.authentication.accessToken);
    }
  }, [response]);

  const signOut = async () => {
    await AsyncStorage.removeItem("@user");
    setUserInfo(null);
  };

  const createCustomCrashEvent = () => {
    try {
      const user = [];
      console.log(user[0].hello);
    } catch (error) {
      console.log(error)
      crashlytics().recordError(error);
      ToastAndroid.show("Custom Crash Event Triggered", ToastAndroid.LONG);
    }
  };

  const handleGetRequest = async () => {
    try {
      const res = await fetch(urlInput);
      const data = await res.json();
      setGetResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setGetResponse(error.message);
    }
  };

  return (
      <View style={styles.container}>
        {helloMessage && <Text>{helloMessage}</Text>}
        {!userInfo ? (
            <View>
              <Button
                  title="Sign in with Google"
                  disabled={!request}
                  onPress={() => {
                    console.log("After press")
                    promptAsync();
                  }}
              />
            </View>
        ) : (
            <View style={styles.card}>
              {/* Display user information */}
              <Text>Email: {userInfo.email}</Text>
              <Text>Verified: {userInfo.verified_email ? "yes" : "no"}</Text>
              <Text>Name: {userInfo.name}</Text>

              <Button title="Sign Out" onPress={signOut} />
            </View>
        )}
        <Button title="Trigger Custom Crash Event" onPress={createCustomCrashEvent} />
        <TextInput
            style={styles.input}
            onChangeText={setUrlInput}
            value={urlInput}
            placeholder="Enter URL"
        />
        <Button title="Submit" onPress={handleGetRequest} />
        <Text>{getResponse}</Text>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    width: '80%'
  },
});
