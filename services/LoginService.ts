import { apiUrl } from "../src/app-env.config";
import { User } from "../types";
import saveToken from "../src/util/SaveToken";

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
};

export default LoginService;
