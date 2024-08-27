import React from "react";
import { View } from "react-native";
import { WorkType } from "../types";
import commonStyles from "../src/styles/commonStyles";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import WorkTypeList from "../src/components/common/WorkTypeList";
import { getAddWorkTitle } from "../src/util/Work";

type WorkTypeScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const WorkTypeScreen: React.FC<WorkTypeScreenProps> = ({ navigation }) => {
  const handleAddWork = (workType: WorkType) => {
    navigation.navigate("WorkStack", {
      screen: "AddWork",
      params: {
        title: getAddWorkTitle(workType),
        workType,
      },
    });
  };

  return (
    <View style={commonStyles.container}>
      <WorkTypeList
        onPress={handleAddWork}
        onEdit={() => {}}
        onDelete={() => {}}
        onAttendance={(item) => {
          navigation.navigate("WorkStack", {
            screen: "AttendanceScreen",
            params: {
              title: "Select Attendance",
              type: item,
            },
          });
        }}
        readOnly={true}
      />
    </View>
  );
};

export default WorkTypeScreen;
