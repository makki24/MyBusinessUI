import { Button, Icon, Text, useTheme } from "react-native-paper";
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
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();

  const notifier = useRef(
    makeEventNotifier<{ workType: WorkType }, unknown>(
      "OnWorkTypeSelectedAndClosed",
    ),
  ).current;

  const listener = (selectedType: { workType: WorkType }) => {
    workType[1](selectedType.workType);
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
    <View style={commonStyles.simpleRow}>
      <Button onPress={openSelector}>
        Select type
        <Icon source="alpha-t-box" size={20} color={theme.colors.primary} />
      </Button>
      <>
        <Text variant={"titleMedium"}>{workType[0]?.name}</Text>
      </>
    </View>
  );
};

export default WorkTypeSelectorButton;
