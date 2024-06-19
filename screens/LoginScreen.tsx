// LoginScreen.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { androidClientId, expoClientId } from "../app-env.config";
import { useRecoilState } from "recoil";
import { userState } from "../recoil/atom";
import { IconButton, Text } from "react-native-paper";
import Button from "../components/common/Button";
import LoadingError from "../components/common/LoadingError";
import { MAIN_PROFILE_PIC, UI_ELEMENTS_GAP } from "../src/styles/constants";
import PropTypes from "prop-types";
import loginService from "../services/LoginService";
import commonStyles from "../src/styles/commonStyles";

const LoginScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useRecoilState(userState);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
    expoClientId,
  });

  useEffect(() => {
    if (response?.type === "success") {
      loginOrSignUp(response.authentication.accessToken);
    }
  }, [response]);

  const checkUser = async () => {
    const token = await AsyncStorage.getItem("@token");
    if (token) {
      login(token);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const loginFunc = async (token, url: string) => {
    if (!token) return;
    setLoading(true); // Start loading
    try {
      const user = await loginService.login(token, url);
      setUserInfo(user);
      navigation.navigate("Home");
    } catch (loginError) {
      setUserInfo(null);
      throw new Error(loginError.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  const loginOrSignUp = async (token) => {
    try {
      await loginFunc(token, "loginOrSignUp");
    } catch (loginOrSignupError) {
      setError(loginOrSignupError.message);
    }
  };

  const login = async (token) => {
    try {
      await loginFunc(token, "login");
    } catch (loginOrSignupError) {
      setError(loginOrSignupError.message);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("@token");
    setUserInfo(null);
  };

  return (
    <View style={styles.container}>
      {!userInfo ? (
        <View>
          <LoadingError error={error} isLoading={loading} />
          <View style={commonStyles.simpleRow}>
            <Button
              title="Sign in with Google"
              icon={"google"}
              disabled={!request || loading} // Disable the button when loading
              onPress={() => {
                promptAsync();
              }}
            />
            <IconButton
              icon={"refresh"}
              mode={"contained"}
              disabled={!request || loading} // Disable the button when loading
              onPress={() => {
                checkUser();
              }}
            />
          </View>
        </View>
      ) : (
        <View style={styles.loggedInContainer}>
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={styles.profileImageContainer}
          >
            <Image
              source={{ uri: userInfo?.picture || "placeholder_image_url" }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View>
            <Text>Email: {userInfo.email}</Text>
            <Text>Name: {userInfo.name}</Text>
            <View style={styles.button}>
              <Button
                title="Continue to Home"
                onPress={() => navigation.navigate("Home")}
              />
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
    justifyContent: "center",
    alignItems: "center",
  },
  loggedInContainer: {
    flexDirection: "row",
    alignItems: "center",
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

LoginScreen.propTypes = {
  navigation: PropTypes.object.isRequired, // navigation prop is required
};

export default LoginScreen;
