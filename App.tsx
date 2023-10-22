import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {url} from './app.config'

export default function App() {

  const apiUrl = url;

  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "82740835529-o5ahaetmhfilc8ot561hp8hnhmvtfpp2.apps.googleusercontent.com",
    expoClientId: '82740835529-m96lhvjc8lgaj73liqurra8eksrebalu.apps.googleusercontent.com'
  });

  useEffect(() => {
    handleEffect();
  }, [response, token]);

  async function handleEffect() {
    const user = await getLocalUser();
    if (!user) {
      if (response?.type === "success") {
        getUserInfo(response.authentication.accessToken);
      }
    } else {
      setUserInfo(user);
      console.log("loaded locally");
    }
  }

  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };

  let error;
  const getUserInfo = async (token: string) => {
    if (!token) return;
    try {
      const response = await fetch(
          apiUrl,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
      );

      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (e) {
      // Add your own error handler here
      error = e;
      console.log("error connecting", e)
    }
  };
  const a = JSON.stringify(process.env);
  return (
      <View style={styles.container}>
        {!userInfo ? (
            <View>
              <Text style={styles.text}> helloe : {JSON.stringify(process.env) + apiUrl}</Text>
            <Button
                title="Sign in with Google"
                disabled={!request}
                onPress={() => {
                  promptAsync();
                }}
            />
              <Text>{ error ? JSON.stringify(error) : ''}</Text>
            </View>

        ) : (
            <View style={styles.card}>
              {userInfo?.picture && (
                  <Image source={{ uri: userInfo?.picture }} style={styles.image} />
              )}
              <Text style={styles.text}>Email: {userInfo.email}</Text>
              <Text style={styles.text}>
                Verified: {userInfo.verified_email ? "yes" : "no"}
              </Text>
              <Text style={styles.text}>Name: {userInfo.name}</Text>
            </View>
        )}
        <Button
            title="remove local store"
            onPress={async () => await AsyncStorage.removeItem("@user")}
        />
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
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});