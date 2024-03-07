module.exports = {
  apiUrl: process.env.EXPO_PUBLIC_URL ?? "http://192.168.150.103:9191",
  androidClientId:
    process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID ??
    "82740835529-a19jnqjanlffvd06ceqfol0hkoqe2k0h.apps.googleusercontent.com",
  expoClientId:
    process.env.EXPO_PUBLIC_CLIENT_ID ??
    "82740835529-m96lhvjc8lgaj73liqurra8eksrebalu.apps.googleusercontent.com",
};
