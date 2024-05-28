import React, { useEffect } from "react";
import CommonWorkTypeList from "../common/WorkTypeList";
import { View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import { WorkAndSale } from "../../../types";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useRecoilState } from "recoil";
import workAndSaleState from "./atom";
import { useAttendanceConfirmationListner } from "../work/AttendanceScreen";

interface WorkTypeListProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
  route: {
    params: {
      workAndSale: WorkAndSale;
    };
  };
}

const WorkTypeList: React.FC<WorkTypeListProps> = ({ navigation, route }) => {
  const [_workAndSale, setWorkAndSale] = useRecoilState(workAndSaleState);

  useEffect(() => {
    setWorkAndSale(route.params.workAndSale);
  }, [route.params.workAndSale]);

  const onPress = (item) => {
    setWorkAndSale((prevState) => ({
      ...prevState,
      type: item,
    }));

    navigation.navigate("MiddleManStack", {
      screen: "AddReceiver",
      params: { title: "Select Receiver" },
    });
  };

  useAttendanceConfirmationListner(({ type, date, users }) => {
    // setCountry(selectedCountry);

    setWorkAndSale((prevState) => ({
      ...prevState,
      type: type,
      receiver: users,
      quantity: date.length,
      description: `Added by attendance & sale \n${date.map((d: string) => new Date(d).toLocaleDateString()).join(", ")}`,
    }));

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
