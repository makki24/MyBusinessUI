// src/screens/WorksScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useRecoilState } from "recoil";
import workService from "../services/WorkService";
import { usersState, worksState } from "../recoil/atom";
import { Filter, User, WorkType } from "../types";
import commonStyles from "../src/styles/commonStyles";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import ItemsList from "../src/components/common/ItemsList";
import filterService from "../src/service/FilterService";
import WorkItemWithActions from "../src/components/common/work/WorkItemWithActions";
import { FAB } from "react-native-paper";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import { makeEventNotifier } from "../src/components/common/useEventListner";
import { batchEditPayloadState } from "../src/components/work/BatchEdit/atom";
import { getAddWorkTitle } from "../src/util/Work";

type WorksScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const WorksScreen: React.FC<WorksScreenProps> = ({ navigation }) => {
  const notifier = useRef(
    makeEventNotifier<{ workType: WorkType }, unknown>(
      "OnWorksScreenWorkTypeSelectedAndClosed",
    ),
  ).current;
  const userSelectedNotifier = useRef(
    makeEventNotifier<{ user: User }, unknown>(
      "OnUserSelectedAndClosedInAddWork",
    ),
  ).current;
  const typeSelectedNotifier = useRef(
    makeEventNotifier<{ workType: WorkType }, unknown>(
      "OnTypeSelectedAndClosedInAddWork",
    ),
  ).current;
  const attendanceTypeNotifier = useRef(
    makeEventNotifier<{ workType: WorkType }, unknown>(
      "OnAttendanceTypeSelectedAndClosedInAddWork",
    ),
  ).current;
  const attendanceConfirmNotifier = useRef(
    makeEventNotifier<
      {
        type: WorkType;
        date: string[];
        users: User[];
      },
      unknown
    >("OnAttendanceConfirmationInAddWork"),
  ).current;

  const [_editPayload, setEditPayload] = useRecoilState(batchEditPayloadState);
  const [allUsers] = useRecoilState(usersState);

  const [works] = useRecoilState(worksState);
  const [uniqueFilters, setUniqueFilters] = useState<Filter>({
    sender: [],
    receiver: [],
    tags: [],
    user: [],
  });
  const [addWorkType, setAddWorkType] = useState<WorkType>(null);
  const addWorkTypeRef = useRef(addWorkType);

  useEffect(() => {
    getUnique();
  }, []);

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

  const handleSearch = (query) => {
    return works.filter((work) =>
      work.user.name.toLowerCase().includes(query.toLowerCase()),
    );
  };

  const addWork = () => {
    navigation.navigate("WorkStack", {
      screen: "WorkTypeSelectorList",
      params: {
        typeSelectedNotifier: typeSelectedNotifier.name,
        attendanceTypeNotifier: attendanceTypeNotifier.name,
      },
    });
  };

  useEffect(() => {
    addWorkTypeRef.current = addWorkType;
  }, [addWorkType]);

  const typeSelectedListner = ({ workType }) => {
    setAddWorkType(workType);
    selectUsers();
  };

  const attendanceSelectedListner = ({ workType }) => {
    navigation.navigate("WorkStack", {
      screen: "AttendanceScreen",
      params: {
        title: "Select Attendance",
        type: workType,
        notifyId: attendanceConfirmNotifier.name,
      },
    });
  };

  const userSelectedListner = ({ user }) => {
    const selectedType: WorkType = addWorkTypeRef.current;
    navigation.navigate("WorkStack", {
      screen: "AddWork",
      params: {
        title: getAddWorkTitle(selectedType),
        workType: selectedType,
        user: user,
      },
    });
  };

  const selectUsers = () => {
    navigation.navigate("WorkStack", {
      screen: "UserSelectorList",
      params: {
        title: "Select User",
        users: allUsers,
        notifyId: userSelectedNotifier.name,
      },
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
      params: { title: "Select Type", users: [] },
    });
  };

  const onAttendanceConfirmationListner = ({ type, date, users }) => {
    navigation.navigate("WorkStack", {
      screen: "AttendanceConfirmation",
      params: {
        title: `AttendanceConfirmation`,
        type: type,
        date: date,
        users: users,
      },
    });
  };

  notifier.useEventListener(listner, []);
  userSelectedNotifier.useEventListener(userSelectedListner, []);
  typeSelectedNotifier.useEventListener(typeSelectedListner, []);
  attendanceTypeNotifier.useEventListener(attendanceSelectedListner, []);
  attendanceConfirmNotifier.useEventListener(
    onAttendanceConfirmationListner,
    [],
  );

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
