import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import userService from "../../services/UserService";
import { userState } from "../../recoil/atom";
import { useRecoilValue } from "recoil";
import { registerForPushNotificationsAsync } from "../util/Notification";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export default function Notification() {
  const [_, setExpoPushToken] = useState<string>("");
  const loggedInUser = useRecoilValue(userState);

  const saveToken = (token) => {
    setExpoPushToken(token);
    userService.addUser({ ...loggedInUser, notificationToken: token });
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then(saveToken);
  }, []);

  return null;
}
