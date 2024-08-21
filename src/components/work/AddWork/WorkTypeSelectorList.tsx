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
      notifyId: string;
    };
  };
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const WorkTypeSelectorList: React.FC<WorkTypeScreenProps> = ({
  navigation,
  route,
}) => {
  const notifier = useRef(
    makeEventNotifier<{ workType: WorkType }, unknown>(route.params.notifyId),
  ).current;

  const onPress = (workType: WorkType) => {
    notifier.notify({ workType });
    navigation.goBack();
  };

  return (
    <View style={commonStyles.container}>
      <WorkTypeList
        onPress={onPress}
        onEdit={() => {}}
        onDelete={() => {}}
        readOnly={true}
      />
    </View>
  );
};

export default WorkTypeSelectorList;
