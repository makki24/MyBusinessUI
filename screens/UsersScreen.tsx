import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { FAB, Snackbar } from "react-native-paper";
import { useRecoilState } from "recoil";
import UserService from "../services/UserService";
import UserItem from "../components/UserItem";
import { usersState } from "../recoil/atom";
import { User } from "../types";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import ConfirmationModal from "../components/common/ConfirmationModal";
import SearchAndFilter from "../components/common/SearchAndFilter";

type UsersScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const UsersScreen: React.FC<UsersScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useRecoilState(usersState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      setIsRefreshing(true);
      const usersData = await UserService.getUsers();
      setUsers(usersData);
    } catch (fetchError) {
      setError(fetchError.message || "Error fetching users. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMembers(users);
  }, [users]);

  const handleEditUser = (user: User) => {
    if (user.roles.findIndex((role) => role.name === "MEMBER") === -1) {
      return;
    }
    navigation.navigate("UsersStack", {
      screen: "AddUser",
      params: { title: `Edit User: ${user.name}`, user, isEditMode: true },
    });
  };

  const handleDeleteUser = async (user) => {
    setSelectedUser(user);

    setIsDeleteModalVisible(true);
  };

  const navigateToTransactions = (clickedUser: User) => {
    navigation.navigate("UsersStack", {
      screen: "UserReport",
      params: { title: `User Report`, userId: clickedUser.id },
    });
  };

  const confirmDeleteUser = async () => {
    setIsLoading(true);

    try {
      await UserService.deleteUser(selectedUser.id);
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser.id),
      );
      setSnackbarVisible(true); // Show Snackbar on successful deletion
    } catch (deleteError) {
      setError(deleteError.message || "Error deleting user. Please try again.");
    } finally {
      setIsLoading(false);
      setSelectedUser(null);
      setIsDeleteModalVisible(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const onSnackbarDismiss = () => {
    setSnackbarVisible(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase()),
    );
    setMembers(filtered);
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />
      <SearchAndFilter
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        user={users}
        onApply={() => {}}
        filter={false}
      />

      {!error && (
        <FlatList
          data={members}
          renderItem={({ item }) => (
            <UserItem
              user={item}
              onPress={() => navigateToTransactions(item)}
              onEdit={() => handleEditUser(item)}
              onDelete={() => handleDeleteUser(item)}
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
          navigation.navigate("UsersStack", {
            screen: "AddUser",
            params: { title: "Add User" },
          })
        }
      />

      {/* Delete User Modal */}
      <ConfirmationModal
        warningMessage={"Are you sure you want to delete this user?"}
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        onConfirm={confirmDeleteUser}
      />

      {/* Snackbar for successful deletion */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={onSnackbarDismiss}
        duration={3000}
      >
        {`User deleted successfully`}
      </Snackbar>
    </View>
  );
};

export default UsersScreen;
