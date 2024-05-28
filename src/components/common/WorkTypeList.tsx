import WorkTypeItem from "../../../components/WorkTypeItem";
import { FlatList, RefreshControl, View } from "react-native";
import React, { useEffect, useState } from "react";
import LoadingError from "../../../components/common/LoadingError";
import SearchAndFilter from "../../../components/common/SearchAndFilter";
import WorkService from "../../../services/WorkService";
import { useRecoilState } from "recoil";
import { workTypesState } from "../../../recoil/atom";
import { WorkType } from "../../../types";

interface WorkTypeListProps {
  onPress: (workType: WorkType) => void;
  onEdit: (workType: WorkType) => void; // New prop for the Edit action
  onDelete: (workType: WorkType) => void;
  onAttendance: (workType: WorkType) => void;
  readOnly: boolean;
}

const WorkTypeList: React.FC<WorkTypeListProps> = ({
  onPress,
  onEdit,
  onDelete,
  onAttendance,
  readOnly,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [workTypes, setWorkTypes] = useRecoilState(workTypesState);
  const [filteredWorkTypes, setFilteredWorkTypes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFilteredWorkTypes(workTypes);
  }, [workTypes]);

  const fetchWorkTypes = async () => {
    try {
      setIsRefreshing(true);

      const workTypesData = await WorkService.getWorkTypes();
      setWorkTypes(workTypesData);
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

  const handleSearch = (query) => {
    const filtered = workTypes.filter((workType) =>
      workType.name.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredWorkTypes(filtered);
  };

  const handleRefresh = () => {
    fetchWorkTypes();
  };

  return (
    <>
      <SearchAndFilter onApply={() => {}} handleSearch={handleSearch} />
      <FlatList
        data={filteredWorkTypes}
        ListHeaderComponent={() => (
          <View>
            <LoadingError error={error} isLoading={isRefreshing} />
          </View>
        )}
        renderItem={({ item }) => (
          <WorkTypeItem
            workType={item}
            onPress={onPress}
            onEdit={onEdit}
            onDelete={onDelete}
            onAttendance={onAttendance}
            readOnly={readOnly}
          />
        )}
        keyExtractor={(item) => item.id.toString()} // Ensure key is a string
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
    </>
  );
};

export default WorkTypeList;
