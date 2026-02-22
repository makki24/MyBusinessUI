import React, { useRef } from "react";
import { View } from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { WorkType } from "../../../../types";
import WorkTypeList from "../../common/WorkTypeList";
import commonStyles from "../../../styles/commonStyles";
import { makeEventNotifier } from "../../common/useEventListner";

type WorkTypeScreenProps = {
  route: {
    params: {
      typeSelectedNotifier: string;
      attendanceTypeNotifier: string;
    };
  };
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const WorkTypeSelectorList: React.FC<WorkTypeScreenProps> = ({ route }) => {
  const typeSelectedNotifier = useRef(
    makeEventNotifier<{ workType: WorkType }, unknown>(
      route.params.typeSelectedNotifier,
    ),
  ).current;
  const attendanceTypeNotifier = useRef(
    makeEventNotifier<{ workType: WorkType }, unknown>(
      route.params.attendanceTypeNotifier,
    ),
  ).current;

  const onPress = (workType: WorkType) => {
    typeSelectedNotifier.notify({ workType });
  };

  const onAttendance = (workType: WorkType) => {
    attendanceTypeNotifier.notify({ workType });
  };

  return (
    <View style={commonStyles.container}>
      <WorkTypeList
        onPress={onPress}
        onEdit={() => {}}
        onDelete={() => {}}
        readOnly={true}
        onAttendance={onAttendance}
      />
    </View>
  );
};

export default WorkTypeSelectorList;
