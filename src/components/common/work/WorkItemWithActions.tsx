import React, { useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { View, StyleSheet, TouchableOpacity } from "react-native";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Swipeable from "react-native-gesture-handler/Swipeable";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import WorkItem from "../../../../components/WorkItem";
import ConfirmationModal from "../../../../components/common/ConfirmationModal";
import { Work } from "../../../../types";
import WorkService from "../../../../services/WorkService";
import { useRecoilState, useRecoilValue } from "recoil";
import { worksState } from "../../../../recoil/atom";
import { canDelete as canDeleteSelector } from "../../../../recoil/selectors";
import LoadingError from "../../../../components/common/LoadingError";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  [key: string]: {
    screen: string;
    params: {
      title: string;
      work?: unknown;
      isEditMode?: boolean;
    };
  };
  // Add other screens here
};

type NavigationProp = StackNavigationProp<RootStackParamList, "WorkStack">;

interface WorkItemWithActionsProps {
  item: Work;
  hideUserDetails?: boolean;
}

const WorkItemWithActions: React.FC<WorkItemWithActionsProps> = ({
  item,
  hideUserDetails = false,
}) => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work>(null);
  const userCanDelete = useRecoilValue(canDeleteSelector);
  const [_works, setWorks] = useRecoilState(worksState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();

  const handleEditWork = (work: Work) => {
    const index = navigation.getParent().getState().index;
    const stack = navigation.getParent().getState().routes[index].name;
    const serializedDate = work.date.toISOString();
    const title = work.pricePerUnit
      ? `(${work.pricePerUnit} per ${work.type.unit})`
      : "";
    navigation.navigate(stack, {
      screen: "AddWork",
      params: {
        title: `Edit Work ${title}`,
        work: { ...work, date: serializedDate },
        isEditMode: true,
      },
    });
  };

  const handleDeleteWork = (work) => {
    setSelectedWork(work);

    setIsDeleteModalVisible(true);
  };

  const confirmDeleteWork = async () => {
    setIsLoading(true);
    setError("");

    try {
      await WorkService.deleteWork(selectedWork.id);
      setWorks((prevWorks) =>
        prevWorks.filter((work) => work.id !== selectedWork.id),
      );
    } catch (deleteError) {
      setError(deleteError.message || "Error deleting work. Please try again.");
    } finally {
      setIsLoading(false);
      setSelectedWork(null);
      setIsDeleteModalVisible(false);
    }
  };

  return (
    <>
      <LoadingError error={error} isLoading={isLoading} />
      <WorkItem
        work={item}
        onPress={() => handleEditWork(item)}
        hideUserDetails={hideUserDetails}
        onDelete={() => handleDeleteWork(item)}
        canDelete={userCanDelete}
      />
      <ConfirmationModal
        warningMessage={"Are you sure you want to delete this work?"}
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        onConfirm={confirmDeleteWork}
      />
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const styles = StyleSheet.create({
  deleteButton: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
});

export default WorkItemWithActions;
