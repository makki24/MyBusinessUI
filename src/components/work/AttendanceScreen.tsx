import React, { useEffect, useState } from "react";
import { View, FlatList } from "react-native";
import { useRecoilValue } from "recoil";
import { otherUsersState } from "../../../recoil/selectors";
import AttendanceUserItem from "./AttendanceUserItem";
import { Tag, User, WorkType } from "../../../types";
import SearchAndFilter from "../../../components/common/SearchAndFilter";
import commonStyles from "../../styles/commonStyles";
import Button from "../../../components/common/Button";
import Labels from "../../../components/common/Labels";
import { DatePickerModal } from "react-native-paper-dates";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

interface AttendanceScreenProps {
  route: {
    params: {
      type: WorkType;
      tags: Tag[];
    };
  };
  navigation: NavigationProp<ParamListBase>;
}

const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  navigation,
  route,
}) => {
  const users = useRecoilValue(otherUsersState);
  const selectedUsersState = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [selectedUsers, setSelectedUsers] = selectedUsersState;
  const [selectedUserLabel, setSelectedUserLabel] = useState<User[]>([]);
  const [dateModelOpen, setDateModelOpen] = useState<boolean>(false);
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    setSelectedUserLabel(
      users.filter((user) =>
        selectedUsers.some((selectedUser) => selectedUser === user.id),
      ),
    );
  }, [selectedUsers]);

  const selectUser = (userId: string) => {
    setSelectedUsers((prevState) => {
      if (prevState.includes(userId)) {
        return prevState.filter((id) => id !== userId);
      } else {
        return [...prevState, userId];
      }
    });
  };

  const onConfirm = (params) => {
    setDateModelOpen(false);
    setDates(params.dates);
    navigation.navigate("WorkStack", {
      screen: "AttendanceConfirmation",
      params: {
        title: `AttendanceConfirmation`,
        type: route.params.type,
        date: params.dates.map((date) => date.toISOString()),
        users: selectedUserLabel,
        tags: route.params.tags,
      },
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredUsers(filtered);
  };

  const renderItem = ({ item }: { item: User }) => (
    <AttendanceUserItem
      item={item}
      onSelect={selectUser}
      selectedUsersState={selectedUsersState}
    />
  );

  return (
    <View style={commonStyles.container}>
      <Labels items={selectedUserLabel} label={"Selected"} />
      <SearchAndFilter
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        onApply={() => {}}
        sort={false}
        filter={false}
      />
      <FlatList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id!}
        numColumns={3}
      />
      <Button
        icon={"calendar"}
        title={"Continue"}
        onPress={() => {
          setDateModelOpen(true);
        }}
      />
      <DatePickerModal
        locale="en"
        mode="multiple"
        visible={dateModelOpen}
        onDismiss={() => setDateModelOpen(false)}
        dates={dates}
        onConfirm={onConfirm}
      />
    </View>
  );
};

export default AttendanceScreen;
