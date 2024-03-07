// src/screens/WorksScreen.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { FAB, Text, Button, Modal, Portal } from "react-native-paper";
import { useRecoilState } from "recoil";
import WorkService from "../services/WorkService";
import WorkItem from "../components/WorkItem";
import { worksState } from "../recoil/atom";
import { User, Work } from "../types";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import SearchAndFilter from "../components/common/SearchAndFilter";
import workService from "../services/WorkService";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

type WorksScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const WorksScreen: React.FC<WorksScreenProps> = ({ navigation }) => {
  const [works, setWorks] = useRecoilState(worksState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [workUsers, setWorkUsers] = useState<User[]>();

  const transformAndSetWork = (worksData) => {
    worksData = worksData.map((work) => ({
      ...work,
      date: new Date(work.date),
    }));
    setWorks(worksData);
  };

  const fetchWorks = async () => {
    try {
      setIsRefreshing(true);

      const worksData = await WorkService.getWorks();
      const userSet = new Set<User>();
      worksData.forEach((expn) => {
        userSet.add(expn.user);
      });
      setWorkUsers([...userSet]);
      transformAndSetWork(worksData);
    } catch (error) {
      setError(error.message || "Error fetching works. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const handleEditWork = (work: Work) => {
    const serializedDate = work.date.toISOString();
    const title = work.pricePerUnit
      ? `(${work.pricePerUnit} per ${work.type.unit})`
      : "";
    navigation.navigate("WorkStack", {
      screen: "AddWork",
      params: {
        title: `Edit Work ${title}`,
        work: { ...work, date: serializedDate },
        isEditMode: true,
      },
    });
  };

  const handleDeleteWork = async (work) => {
    setSelectedWork(work);
    setIsLoading(true);

    try {
      setIsDeleteModalVisible(true);
    } catch (error) {
      setError(
        error.response?.data ||
          "Error checking work details. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteWork = async () => {
    setIsLoading(true);

    try {
      await WorkService.deleteWork(selectedWork.id);
      setWorks((prevWorks) =>
        prevWorks.filter((work) => work.id !== selectedWork.id),
      );
    } catch (error) {
      setError(error.message || "Error deleting work. Please try again.");
    } finally {
      setIsLoading(false);
      setSelectedWork(null);
      setIsDeleteModalVisible(false);
    }
  };

  const handleRefresh = () => {
    fetchWorks();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const onApply = async (arg) => {
    setIsLoading(true);
    try {
      const filteredWorks = await workService.filterWork(arg);
      transformAndSetWork(filteredWorks);
    } catch (e) {
      setError(e.message || "Error setting filters.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />
      <SearchAndFilter
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        user={workUsers}
        onApply={onApply}
      />

      {!error && (
        <FlatList
          data={works}
          renderItem={({ item }) => (
            <WorkItem
              work={item}
              onPress={() => handleEditWork(item)}
              onDelete={() => handleDeleteWork(item)}
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
            screen: "WorkType",
            params: { title: "Select Work type" },
          })
        }
      />

      {/* Delete Work Modal */}
      <Portal>
        <Modal
          visible={isDeleteModalVisible}
          onDismiss={() => setIsDeleteModalVisible(false)}
          contentContainerStyle={commonStyles.modalContainer}
        >
          <Text>Are you sure you want to delete this work?</Text>
          <View style={commonStyles.modalButtonGap} />
          <View style={commonStyles.modalButtonGap} />
          <Button
            icon="cancel"
            mode="outlined"
            onPress={() => setIsDeleteModalVisible(false)}
          >
            Cancel
          </Button>
          <View style={commonStyles.modalButtonGap} />
          <Button icon="delete" mode="contained" onPress={confirmDeleteWork}>
            Delete
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

export default WorksScreen;
