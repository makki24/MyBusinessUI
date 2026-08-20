import React, { useRef, useState } from "react";
import { View } from "react-native";
import { useRecoilValue } from "recoil";
import { otherUsersState } from "../../../../recoil/selectors";
import { User, WorkType } from "../../../../types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import commonStyles from "../../../styles/commonStyles";
import Button from "../../../../components/common/Button";
import { DatePickerModal } from "react-native-paper-dates";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import UsersSelector from "../../common/UsersSelector";
import { makeEventNotifier } from "../../common/useEventListner";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AttendanceScreenProps {
  route: {
    params: {
      type: WorkType;
      notifyId: string;
    };
  };
  navigation: NavigationProp<ParamListBase>;
}

const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ route }) => {
  const users = useRecoilValue(otherUsersState);
  const selectedUserState = useState<User[]>([]);
  const [dateModelOpen, setDateModelOpen] = useState<boolean>(false);
  const [dates, setDates] = useState<Date[]>([]);

  const notifier = useRef(
    makeEventNotifier<
      {
        type: WorkType;
        date: string[];
        users: User[];
      },
      unknown
    >(route.params.notifyId),
  ).current;

  const onConfirm = (params) => {
    setDateModelOpen(false);
    setDates(params.dates);
    notifier.notify({
      type: route.params.type,
      date: params.dates.map((date) => date.toISOString()),
      users: selectedUserState[0],
    });
  };

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1 }}>
        <UsersSelector allUsers={users} selectedUserState={selectedUserState} />
      </View>

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.08)",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <Button
          style={{ margin: 0 }}
          icon={"calendar"}
          title={"Continue"}
          disabled={selectedUserState[0].length === 0}
          onPress={() => {
            setDateModelOpen(true);
          }}
        />
      </View>

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
