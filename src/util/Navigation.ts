import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { PushNotificationTrigger } from "expo-notifications/src/Notifications.types";

export const getInitialURL = async () => {
  // First, you may want to do the default deep link handling
  // Check if app was opened from a deep link
  const url = await Linking.getInitialURL();

  if (url != null) {
    return url;
  }

  // Handle URL from expo push notifications
  const response = await Notifications.getLastNotificationResponseAsync();

  return (response?.notification.request.trigger as PushNotificationTrigger)
    ?.remoteMessage.data.url;
};

export const subscribe = (listener) => {
  const onReceiveURL = ({ url }: { url: string }) => listener(url);

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

      // Any custom logic to see whether the URL needs to be handled
      //...

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
