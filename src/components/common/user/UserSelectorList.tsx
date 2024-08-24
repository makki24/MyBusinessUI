import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { User } from "../../../../types";
import commonStyles from "../../../styles/commonStyles";
import { makeEventNotifier } from "../useEventListner";
import UsersSelector from "../UsersSelector";

type UserSelectorListProps = {
  route: {
    params: {
      notifyId: string;
      users: User[];
    };
  };
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const UserSelectorList: React.FC<UserSelectorListProps> = ({
  navigation,
  route,
}) => {
  const selectedUserState = useState<User[]>([]);
  const [selectedUser] = selectedUserState;
  const notifier = useRef(
    makeEventNotifier<{ user: User }, unknown>(route.params.notifyId),
  ).current;

  useEffect(() => {
    if (selectedUser[0]) notify(selectedUser[0]);
  }, [selectedUser]);

  const notify = (user: User) => {
    notifier.notify({ user: user });
    navigation.goBack();
  };

  return (
    <View style={commonStyles.container}>
      <UsersSelector
        multiple={false}
        allUsers={route.params.users}
        selectedUserState={selectedUserState}
      />
    </View>
  );
};

export default UserSelectorList;
