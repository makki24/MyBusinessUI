import { apiUrl } from "../app-env.config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

const saveToken = (responseArg) => {
  const authHeader = responseArg.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    AsyncStorage.setItem("@token", token);
  }
};

const LoginService = {
  login: async (token: string, url: string): Promise<User> => {
    const userResponse = await fetch(`${apiUrl}/${url}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!userResponse.ok) {
      // throw new Error("براہ کرم دوبارہ لاگ ان کریں۔");
      throw new Error(
        "Token is invalid or expired / براہ کرم دوبارہ لاگ ان کریں۔",
      );
    }
    if (url === "loginOrSignUp") saveToken(userResponse);
    return await userResponse.json();
  },
  impersonate: async (token: string, user: User): Promise<User> => {
    const userResponse = await fetch(`${apiUrl}/impersonate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!userResponse.ok) {
      // throw new Error("براہ کرم دوبارہ لاگ ان کریں۔");
      throw new Error(
        "Token is invalid or expired / براہ کرم دوبارہ لاگ ان کریں۔",
      );
    }
    saveToken(userResponse);
    return await userResponse.json();
  },
};

export default LoginService;
