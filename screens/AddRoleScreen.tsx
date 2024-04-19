// src/screens/AddRoleScreen.tsx
import React, { useState } from "react";
import { View } from "react-native";
import { useRecoilState } from "recoil";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import RolesService from "../services/RolesService";
import { rolesState } from "../recoil/atom";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { Role } from "../types";
import { NavigationProp, ParamListBase } from "@react-navigation/native"; // Adjust the path accordingly

interface AddRoleScreenProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
}

const AddRoleScreen: React.FC<AddRoleScreenProps> = ({ navigation }) => {
  const [roleName, setRoleName] = useState("");
  const [_, setRoles] = useRecoilState(rolesState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddRole = async () => {
    try {
      if (!roleName) {
        setError("Role name cannot be empty"); // Set the error message
        return;
      }

      setIsLoading(true); // Set loading to true

      // Call your API service to add a new role
      const newRole = await RolesService.addRole({ name: roleName } as Role);

      // Update Recoil state with the new role
      setRoles((prevRoles) => [...prevRoles, newRole]);

      // Navigate back to the Roles screen
      navigation.goBack();
    } catch (addError) {
      setError(addError.response?.data || "An error occurred"); // Set the error message
    } finally {
      setIsLoading(false); // Set loading to false regardless of success or failure
    }
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />

      <Input
        placeholder="Enter role name"
        value={roleName}
        onChangeText={setRoleName}
      />
      <Button title="Add Role" onPress={handleAddRole} />
    </View>
  );
};

export default AddRoleScreen;
