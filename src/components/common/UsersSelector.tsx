import { FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { User } from "../../../types";
import AttendanceUserItem from "../work/Attendance/AttendanceUserItem";
import Labels from "../../../components/common/Labels";
import SearchAndFilter from "../../../components/common/SearchAndFilter";

interface UsersSelectorProps {
  allUsers: User[];
  selectedUserState: [User[], React.Dispatch<React.SetStateAction<User[]>>];
  multiple?: boolean;
}

const UsersSelector: React.FC<UsersSelectorProps> = ({
  allUsers,
  selectedUserState,
  multiple = true,
}) => {
  const selectedUsersState = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = selectedUsersState;
  const [selectedUserLabel, setSelectedUserLabel] = selectedUserState;
  const [filteredUsers, setFilteredUsers] = useState<User[]>(allUsers);

  const handleSearch = (query) => {
    const filtered = allUsers.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    setFilteredUsers(allUsers);
  }, [allUsers]);

  useEffect(() => {
    setSelectedUserLabel(
      allUsers.filter((user) =>
        selectedUsers.some((selectedUser) => selectedUser === user.id),
      ),
    );
  }, [selectedUsers]);

  const selectUser = (userId: string) => {
    setSelectedUsers((prevState) => {
      if (!multiple) prevState = [];
      if (prevState.includes(userId)) {
        return prevState.filter((id) => id !== userId);
      } else {
        return [...prevState, userId];
      }
    });
  };

  const renderItem = ({ item }: { item: User }) => (
    <AttendanceUserItem
      item={item}
      onSelect={selectUser}
      selectedUsersState={selectedUsersState}
    />
  );

  return (
    <>
      <SearchAndFilter
        handleSearch={handleSearch}
        onApply={() => {}}
        sort={false}
        filter={false}
      />
      {multiple && <Labels items={selectedUserLabel} label={"Selected"} />}
      <FlatList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id!}
        numColumns={3}
      />
    </>
  );
};

export default UsersSelector;
