import AsyncStorage from "@react-native-async-storage/async-storage";

const saveToken = (responseArg) => {
  const authHeader = responseArg.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    AsyncStorage.setItem("@token", token);
  }
};

export default saveToken;
