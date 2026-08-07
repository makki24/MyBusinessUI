import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { PushNotificationTrigger } from "expo-notifications/src/Notifications.types";
import { Alert } from "react-native";

export const getInitialURL = async () => {
  // First, you may want to do the default deep link handling
  // Check if app was opened from a deep link
  const url = await Linking.getInitialURL();
  const prefix = Linking.createURL("/");

  Alert.alert(
    "DEBUG getInitialURL",
    `prefix: ${prefix}\ninitialURL: ${url}\nwill check notification...`,
  );

  if (url != null) {
    return url;
  }

  // Handle URL from expo push notifications
  const response = await Notifications.getLastNotificationResponseAsync();

  const notifUrl = (
    response?.notification.request.trigger as PushNotificationTrigger
  )?.remoteMessage?.data?.url;

  const notifData = JSON.stringify(
    (response?.notification.request.trigger as PushNotificationTrigger)
      ?.remoteMessage?.data,
    null,
    2,
  );

  Alert.alert(
    "DEBUG notification URL",
    `notifUrl: ${notifUrl}\nfull data: ${notifData}`,
  );

  return notifUrl;
};

export const subscribe = (listener) => {
  const onReceiveURL = ({ url }: { url: string }) => {
    Alert.alert("DEBUG subscribe URL", `url event: ${url}`);
    listener(url);
  };

  // Listen to incoming links from deep linking
  const eventListenerSubscription = Linking.addEventListener(
    "url",
    onReceiveURL,
  );

  // Listen to expo push notifications
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const url = (
        response?.notification.request.trigger as PushNotificationTrigger
      )?.remoteMessage?.data?.url;

      Alert.alert("DEBUG notif tap", `url from notif: ${url}`);

      // Let React Navigation handle the URL
      listener(url);
    },
  );

  return () => {
    // Clean up the event listeners
    eventListenerSubscription.remove();
    subscription.remove();
  };
};
