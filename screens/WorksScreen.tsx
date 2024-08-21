// src/screens/WorksScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useRecoilState } from "recoil";
import workService from "../services/WorkService";
import { worksState } from "../recoil/atom";
import { Filter, WorkType } from "../types";
import commonStyles from "../src/styles/commonStyles";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import ItemsList from "../src/components/common/ItemsList";
import filterService from "../src/service/FilterService";
import WorkItemWithActions from "../src/components/common/work/WorkItemWithActions";
import { FAB } from "react-native-paper";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import { makeEventNotifier } from "../src/components/common/useEventListner";
import { batchEditPayloadState } from "../src/components/work/BatchEdit/atom";

type WorksScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const WorksScreen: React.FC<WorksScreenProps> = ({ navigation }) => {
  const notifier = useRef(
    makeEventNotifier<{ workType: WorkType }, unknown>(
      "OnWorksScreenWorkTypeSelectedAndClosed",
    ),
  ).current;
  const [_editPayload, setEditPayload] = useRecoilState(batchEditPayloadState);

  const [works] = useRecoilState(worksState);
  const [uniqueFilters, setUniqueFilters] = useState<Filter>({
    sender: [],
    receiver: [],
    tags: [],
    user: [],
  });

  const transformAndSetWork = (worksData) => {
    return worksData.map((work) => ({
      ...work,
      date: new Date(work.date),
    }));
  };

  const getUnique = async () => {
    const uniQueFilter = await filterService.getWorkFilters();
    setUniqueFilters(uniQueFilter);
  };

  useEffect(() => {
    getUnique();
  }, []);

  const handleSearch = (query) => {
    return works.filter((work) =>
      work.user.name.toLowerCase().includes(query.toLowerCase()),
    );
  };

  const addWork = () => {
    navigation.navigate("WorkStack", {
      screen: "WorkType",
      params: { title: "Select Work types", addingWork: true },
    });
  };

  const onBatchEdit = () => {
    const index = navigation.getParent().getState().index;
    const stack = navigation.getParent().getState().routes[index].name;

    navigation.navigate(stack, {
      screen: "WorkTypeSelectorList",
      params: {
        notifyId: notifier.name,
      },
    });
  };

  const listner = (selectedType: { workType: WorkType }) => {
    setEditPayload((prev) => ({ ...prev, type: selectedType.workType }));
    navigation.navigate("WorkStack", {
      screen: "WorkersList",
      params: { title: "Select Type" },
    });
  };

  notifier.useEventListener(listner, []);

  return (
    <View style={commonStyles.container}>
      <ItemsList
        uniQueFilterValues={uniqueFilters}
        searchBar={true}
        sort={true}
        handleSearch={handleSearch}
        fetchData={workService.filterWork}
        recoilState={worksState}
        renderItem={({ item }) => <WorkItemWithActions item={item} />}
        transFormData={transformAndSetWork}
        onAdd={addWork}
      />
      <FAB
        style={commonScreenStyles.fabEdit}
        icon="playlist-edit"
        testID="editWork"
        onPress={onBatchEdit}
      />
    </View>
  );
};

export default WorksScreen;
