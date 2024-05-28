import React, { useState } from "react";
import { View } from "react-native";
import { useRecoilValue } from "recoil";
import { otherUsersState } from "../../../recoil/selectors";
import { User, WorkType } from "../../../types";
import commonStyles from "../../styles/commonStyles";
import Button from "../../../components/common/Button";
import { DatePickerModal } from "react-native-paper-dates";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import UsersSelector from "../common/UsersSelector";
import { makeEventNotifier } from "../common/useEventListner";

interface AttendanceScreenProps {
  route: {
    params: {
      type: WorkType;
    };
  };
  navigation: NavigationProp<ParamListBase>;
}

const notifer = makeEventNotifier<{
  type: WorkType;
  date: string[];
  users: User[];
}>("OnAttendanceConfirmed");

// Youy can add a snippet to generate this
export function useAttendanceConfirmationListner<T>(
  listener: typeof notifer.notify,
  deps: ReadonlyArray<T>,
) {
  notifer.useEventListener(listener, deps);
}

const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ route }) => {
  const users = useRecoilValue(otherUsersState);
  const selectedUserState = useState<User[]>([]);
  const [dateModelOpen, setDateModelOpen] = useState<boolean>(false);
  const [dates, setDates] = useState<Date[]>([]);

  const onConfirm = (params) => {
    setDateModelOpen(false);
    setDates(params.dates);
    notifer.notify({
      type: route.params.type,
      date: params.dates.map((date) => date.toISOString()),
      users: selectedUserState[0],
    });
  };

  return (
    <View style={commonStyles.container}>
      <UsersSelector allUsers={users} selectedUserState={selectedUserState} />
      <Button
        icon={"calendar"}
        title={"Continue"}
        onPress={() => {
          setDateModelOpen(true);
        }}
      />
      <DatePickerModal
        locale="en"
        mode="multiple"
        visible={dateModelOpen}
        onDismiss={() => setDateModelOpen(false)}
        dates={dates}
        onConfirm={onConfirm}
      />
    </View>
  );
};

export default AttendanceScreen;
