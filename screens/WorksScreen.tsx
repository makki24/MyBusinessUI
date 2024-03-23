// src/screens/WorksScreen.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { FAB } from "react-native-paper";
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
import ConfirmationModal from "../components/common/ConfirmationModal";

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
      const userSet: User[] = [];
      worksData.forEach((expn) => {
        if (!userSet.some((user) => user.id === expn.user.id))
          userSet.push(expn.user);
      });
      setWorkUsers([...userSet]);
      transformAndSetWork(worksData);
    } catch (fetchError) {
      setError(fetchError.message || "Error fetching works. Please try again.");
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

  const handleDeleteWork = (work) => {
    setSelectedWork(work);

    setIsDeleteModalVisible(true);
  };

  const confirmDeleteWork = async () => {
    setIsLoading(true);

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
      <ConfirmationModal
        warningMessage={"Are you sure you want to delete this work?"}
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        onConfirm={confirmDeleteWork}
      />
    </View>
  );
};

export default WorksScreen;
