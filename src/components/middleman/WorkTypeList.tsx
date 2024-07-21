import React from "react";
import CommonWorkTypeList from "../common/WorkTypeList";
import { View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import { Work, WorkAndSale } from "../../../types";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useRecoilState } from "recoil";
import { middleManState } from "./atom";
import { useAttendanceConfirmationListner } from "../work/Attendance/AttendanceScreen";

interface WorkTypeListProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
  route: {
    params: {
      workAndSale: WorkAndSale;
    };
  };
}

const WorkTypeList: React.FC<WorkTypeListProps> = ({ navigation }) => {
  const [_workAndSale, setWorkAndSale] = useRecoilState(middleManState);

  const onPress = (item) => {
    setWorkAndSale(
      (prevState): WorkAndSale => ({
        ...prevState,
        works: [
          {
            type: item,
          },
        ] as Work[],
      }),
    );

    navigation.navigate("MiddleManStack", {
      screen: "AddReceiver",
      params: { title: "Select Receiver" },
    });
  };

  useAttendanceConfirmationListner(({ type, date, users }) => {
    const description = `Added by attendance & sale \n${date.map((d: string) => new Date(d).toLocaleDateString()).join(", ")}`;
    const works: Work[] = [];

    users.forEach((user) => {
      works.push({
        type: type,
        user: user,
        quantity: date.length,
        description,
        date: new Date(),
      } as Work);
    });

    setWorkAndSale(
      (prevState): WorkAndSale => ({
        ...prevState,
        works,
      }),
    );

    navigation.navigate("MiddleManStack", {
      screen: "WorkAndSale",
      params: { title: "Confirm Details " },
    });
  }, []);

  return (
    <View style={commonStyles.container}>
      <CommonWorkTypeList
        onPress={onPress}
        onEdit={() => {}}
        onDelete={() => {}}
        onAttendance={(item) => {
          navigation.navigate("MiddleManStack", {
            screen: "AttendanceScreen",
            params: {
              title: "Select Attendance",
              type: item,
              tags: [],
            },
          });
        }}
        readOnly={true}
      />
    </View>
  );
};

export default WorkTypeList;
