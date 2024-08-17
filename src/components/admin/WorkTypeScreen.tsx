import React, { useState } from "react";
import { View } from "react-native";
import { FAB } from "react-native-paper"; // Import Searchbar
import { useRecoilState } from "recoil";
import WorkService from "../../../services/WorkService";
import { workTypesState } from "../../../recoil/atom";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import WorkTypeList from "../common/WorkTypeList";
import commonStyles from "../../styles/commonStyles";
import commonScreenStyles from "../../styles/commonScreenStyles";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

type WorkTypeScreenProps = {
  route: {
    params: {
      addingWork: boolean;
    };
  };
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const WorkTypeScreen: React.FC<WorkTypeScreenProps> = ({
  route,
  navigation,
}) => {
  const [_workTypes, setWorkTypes] = useRecoilState(workTypesState);
  const [_error, setError] = useState(null);
  const [_isLoading, setIsLoading] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleEditWorkType = (workType) => {
    navigation.navigate("AdminStack", {
      screen: "AddWorkType",
      params: { title: "Edit Work Type", workType, isEditMode: true },
    });
  };

  const confirmDeleteWorkType = async () => {
    setIsLoading(true);

    try {
      await WorkService.deleteWorkType(selectedWorkType.id);
      setWorkTypes((prevWorkTypes) =>
        prevWorkTypes.filter((wt) => wt.id !== selectedWorkType.id),
      );
    } catch (deleteError) {
      setError(
        deleteError.message || "Error deleting work type. Please try again.",
      );
    } finally {
      setIsLoading(false);
      setSelectedWorkType(null);
      setIsDeleteModalVisible(false);
    }
  };

  const handleDeleteWorkType = (workType) => {
    setSelectedWorkType(workType);
    setIsDeleteModalVisible(true);
  };

  return (
    <View style={commonStyles.container}>
      <WorkTypeList
        onPress={() => {}}
        onEdit={handleEditWorkType}
        onDelete={handleDeleteWorkType}
        readOnly={route?.params?.addingWork}
      />

      {!route?.params?.addingWork && (
        <FAB
          style={commonScreenStyles.fab}
          icon="plus"
          onPress={() =>
            navigation.navigate("AdminStack", {
              screen: "AddWorkType",
              params: { title: "Add Work type" },
            })
          }
        />
      )}

      {/* Delete Work Type Modal */}
      <ConfirmationModal
        warningMessage={"Are you sure you want to delete this work type?"}
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        onConfirm={confirmDeleteWorkType}
      />
    </View>
  );
};

export default WorkTypeScreen;
