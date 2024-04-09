import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import analytics from '@react-native-firebase/analytics';
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
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const loggedInUser = useRecoilValue(userState)

  const saveToken = (token) => {
    setExpoPushToken(token)
    userService.addUser({ ...loggedInUser, notificationToken: token })
  }


  useEffect(() => {
    registerForPushNotificationsAsync().then(saveToken);
  }, []);

  return null;
}
