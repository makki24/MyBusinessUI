// src/screens/WorksScreen.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { FAB } from "react-native-paper";
import { useRecoilState } from "recoil";
import WorkService from "../services/WorkService";
import WorkItem from "../components/WorkItem";
import { worksState } from "../recoil/atom";
import { Filter, Sort, User, Work } from "../types";
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
  const [defaultSort, setDefaultSort] = useState<Sort[]>([
    {
      property: "date",
      direction: "desc",
    },
  ]); // Use a
  const today = new Date();
  const tomorrow = new Date();
  let defaultFilter: Filter = {
    fromDate: new Date(today.setDate(today.getDate() - 15)),
    toDate: new Date(tomorrow.setDate(tomorrow.getDate() + 1)),
    sender: [],
    receiver: [],
    tags: [],
    user: [],
  };
  const [filteredWorks, setFilteredWorks] = useState([]);

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
    onApply(defaultFilter);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = works.filter((work) =>
      work.user.name.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredWorks(filtered);
  };

  useEffect(() => {
    setFilteredWorks(works);
  }, [works]);

  useEffect(() => {
    onApply(defaultFilter);
  }, [defaultSort]);

  const onApply = async (arg: Filter) => {
    setIsLoading(true);
    defaultFilter = arg;
    try {
      const fetchedFilteredWorks = await workService.filterWork({
        filter: arg,
        sort: defaultSort,
      });
      transformAndSetWork(fetchedFilteredWorks);
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
        sort={true}
        defaultFilter={defaultFilter}
        appliedSort={defaultSort}
        setSort={setDefaultSort}
      />

      {!error && (
        <FlatList
          data={filteredWorks}
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
            params: { title: "Select Work type", addingWork: true },
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
