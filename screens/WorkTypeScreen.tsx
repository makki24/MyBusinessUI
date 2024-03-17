import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { FAB } from "react-native-paper"; // Import Searchbar
import { useRecoilState } from "recoil";
import { workTypesState } from "../recoil/atom";
import WorkTypeItem from "../components/WorkTypeItem";
import { WorkType } from "../types";
import WorkService from "../services/WorkService";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import SearchAndFilter from "../components/common/SearchAndFilter";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import ConfirmationModal from "../components/common/ConfirmationModal";

type WorkTypeScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const WorkTypeScreen: React.FC<WorkTypeScreenProps> = ({ navigation }) => {
  const [workTypes, setWorkTypes] = useRecoilState(workTypesState);
  const [filteredWorkTypes, setFilteredWorkTypes] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWorkTypes = async () => {
    try {
      setIsRefreshing(true);

      const workTypesData = await WorkService.getWorkTypes();
      setWorkTypes(workTypesData);
      setFilteredWorkTypes(workTypesData);
    } catch (fetchError) {
      setError(
        fetchError.message || "Error fetching work types. Please try again.",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkTypes();
  }, []);

  useEffect(() => {
    setFilteredWorkTypes(workTypes);
  }, [workTypes]);

  const handleEditWorkType = (workType) => {
    navigation.navigate("WorkStack", {
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
      setFilteredWorkTypes((prevWorkTypes) =>
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

  const handleRefresh = () => {
    fetchWorkTypes();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = workTypes.filter((workType) =>
      workType.name.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredWorkTypes(filtered);
  };

  const handleAddWork = (workType: WorkType) => {
    navigation.navigate("WorkStack", {
      screen: "AddWork",
      params: {
        title:
          `Add ${workType.name}` +
          (workType.unit !== "null"
            ? ` (${workType.pricePerUnit} per ${workType.unit})`
            : ""),
        workType,
      },
    });
  };

  return (
    <View style={commonStyles.container}>
      {/* Searchbar */}
      <SearchAndFilter
        onApply={() => {}}
        searchQuery={searchQuery}
        handleSearch={handleSearch}
      />

      <LoadingError error={error} isLoading={isLoading} />

      {!error && (
        <FlatList
          data={filteredWorkTypes}
          renderItem={({ item }) => (
            <WorkTypeItem
              workType={item}
              onPress={() => handleAddWork(item)}
              onEdit={(workType) => handleEditWorkType(workType)}
              onDelete={() => handleDeleteWorkType(item)}
            />
          )}
          keyExtractor={(item) => item.id.toString()} // Ensure key is a string
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}

      <FAB
        style={commonScreenStyles.fab}
        icon="plus"
        onPress={() =>
          navigation.navigate("WorkStack", {
            screen: "AddWorkType",
            params: { title: "Add Work type" },
          })
        }
      />

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
