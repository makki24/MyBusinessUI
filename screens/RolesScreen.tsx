// roles-screen/RolesScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { FAB, Text, Button, Modal, Portal } from "react-native-paper";
import { useRecoilState } from "recoil";
import { rolesState } from "../recoil/atom";
import RolesService from "../services/RolesService";
import RoleItem from "../components/RoleItem";
import { Role } from "../types";
import { StackActions, useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";

const RolesScreen = ({ navigation }) => {
  const [roles, setRoles] = useRecoilState(rolesState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);

  const fetchRoles = async () => {
    try {
      setIsRefreshing(true);

      const rolesData = await RolesService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error(
        "Error fetching roles:",
        error.response?.data || "Unknown error",
      );
      setError(
        error.response?.data || "Error fetching roles. Please try again.",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleEditRole = (role) => {
    navigation.push("EditRole", { role });
  };

  const handleDeleteRole = async (role) => {
    setSelectedRole(role);
    setIsLoading(true);

    try {
      const usersAssigned = await RolesService.getUsersAssigned(role.id);

      if (usersAssigned.length > 0) {
        setAssignedUsers(usersAssigned);
        setIsAssignModalVisible(true);
      } else {
        setIsDeleteModalVisible(true);
      }
    } catch (error) {
      console.error(
        "Error checking assigned users:",
        error.response?.data || "Unknown error",
      );
      setError(
        error.response?.data ||
          "Error checking assigned users. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteRole = async () => {
    setIsLoading(true);

    try {
      await RolesService.deleteRole(selectedRole.id);
      setRoles((prevRoles) =>
        prevRoles.filter((role) => role.id !== selectedRole.id),
      );
    } catch (error) {
      console.error(
        "Error deleting role:",
        error.response?.data || "Unknown error",
      );
      setError(
        error.response?.data || "Error deleting role. Please try again.",
      );
    } finally {
      setIsLoading(false);
      setSelectedRole(null);
      setIsDeleteModalVisible(false);
    }
  };

  const handleRefresh = () => {
    fetchRoles();
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />

      {!error && (
        <FlatList
          data={roles}
          renderItem={({ item }) => (
            <RoleItem
              role={item}
              onPress={() => handleEditRole(item)}
              onDelete={() => handleDeleteRole(item)}
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
        onPress={() => navigation.navigate("AddRole")}
      />

      {/* Delete Role Modal */}
      <Portal>
        <Modal
          visible={isDeleteModalVisible}
          onDismiss={() => setIsDeleteModalVisible(false)}
          contentContainerStyle={commonStyles.modalContainer}
        >
          <Text>Are you sure you want to delete this role?</Text>
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
          <Button icon="delete" mode="contained" onPress={confirmDeleteRole}>
            Delete
          </Button>
        </Modal>
      </Portal>

      {/* Assign Warning Modal */}
      <Portal>
        <Modal
          visible={isAssignModalVisible}
          onDismiss={() => setIsAssignModalVisible(false)}
          contentContainerStyle={commonStyles.modalContainer}
        >
          <Text>This role cannot be deleted as it is assigned to users.</Text>
          {assignedUsers.map((user, index) => (
            <Text key={index}>{user.username}</Text>
          ))}
          <Button
            icon="check"
            mode="contained"
            onPress={() => setIsAssignModalVisible(false)}
          >
            OK
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

export default RolesScreen;
