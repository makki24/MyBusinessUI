// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Icon, Text, useTheme } from "react-native-paper";
import Button from "../../../../components/common/Button";
import React, { useRef } from "react";
import { View } from "react-native";
import commonStyles from "../../../styles/commonStyles";
import { WorkType } from "../../../../types";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { makeEventNotifier } from "../../common/useEventListner";

interface WorkTypeSelectorButtonProps {
  workType: [WorkType, React.Dispatch<React.SetStateAction<WorkType>>];
}

const WorkTypeSelectorButton: React.FC<WorkTypeSelectorButtonProps> = ({
  workType,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();

  const notifier = useRef(
    makeEventNotifier<{ workType: WorkType }, unknown>(
      "OnWorkTypeSelectedAndClosed",
    ),
  ).current;

  const listener = (selectedType: { workType: WorkType }) => {
    workType[1](selectedType.workType);
    navigation.goBack();
  };
  notifier.useEventListener(listener, []);

  const openSelector = () => {
    const index = navigation.getParent().getState().index;
    const stack = navigation.getParent().getState().routes[index].name;

    navigation.navigate(stack, {
      screen: "WorkTypeSelectorList",
      params: {
        workType: workType[0],
        typeSelectedNotifier: notifier.name,
      },
    });
  };

  return (
    <View style={{ ...commonStyles.simpleRow, marginBottom: 16 }}>
      <Button
        onPress={openSelector}
        title="Select type"
        icon="format-list-bulleted-type"
        mode="outlined"
      />
      <>
        <Text variant={"titleMedium"} style={{ marginLeft: 8 }}>
          {workType[0]?.name}
        </Text>
      </>
    </View>
  );
};

export default WorkTypeSelectorButton;
