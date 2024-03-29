// roles-screen/RolesScreen.js

import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { FAB, Text, Button } from "react-native-paper";
import { useRecoilState } from "recoil";
import { rolesState } from "../recoil/atom";
import RolesService from "../services/RolesService";
import RoleItem from "../components/RoleItem";
import { Role } from "../types";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import PropTypes from "prop-types";
import ConfirmationModal from "../components/common/ConfirmationModal";
import Modal from "../components/common/Modal";

const RolesScreen = ({ navigation }) => {
  const [roles, setRoles] = useRecoilState(rolesState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);

  const fetchRoles = async () => {
    try {
      setIsRefreshing(true);

      const rolesData = await RolesService.getRoles();
      setRoles(rolesData);
    } catch (fetchError) {
      setError(
        fetchError.response?.data || "Error fetching roles. Please try again.",
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
    } catch (deleteError) {
      setError(
        deleteError.response?.data ||
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
    } catch (deleteError) {
      setError(
        deleteError.response?.data || "Error deleting role. Please try again.",
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
      <ConfirmationModal
        warningMessage={"Are you sure you want to delete this role?"}
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        onConfirm={confirmDeleteRole}
      />

      {/* Assign Warning Modal */}
      <Modal
        isModalVisible={isAssignModalVisible}
        setIsModalVisible={() => setIsAssignModalVisible(false)}
        contentContainerStyle={commonStyles.modalContainer}
      >
        <Text>This role cannot be deleted as it is assigned to users.</Text>
        {assignedUsers.map((user, index) => (
          <Text key={index}>{user.name}</Text>
        ))}
        <Button
          icon="check"
          mode="contained"
          onPress={() => setIsAssignModalVisible(false)}
        >
          OK
        </Button>
      </Modal>
    </View>
  );
};

// Define prop types for the component
RolesScreen.propTypes = {
  navigation: PropTypes.object.isRequired, // navigation prop is required
};

export default RolesScreen;
