// src/screens/AddExpenseTypeScreen.tsx
import React, { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRecoilState } from "recoil";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import ExpenseTypesService from "../services/ExpenseTypesService"; // Adjust the path accordingly
import { expenseTypesState } from "../recoil/atom"; // Adjust the path accordingly
import SwitchInput from "../components/common/SwitchInput";
import CommonAddScreenStyles from "../src/styles/commonAddScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";

interface AddExpenseTypeScreenProps {
  navigation: any; // Adjust the type based on your navigation prop type
}

const AddExpenseTypeScreen: React.FC<AddExpenseTypeScreenProps> = ({
  navigation,
}) => {
  const [expenseTypeName, setExpenseTypeName] = useState("");
  const [isReceivingUser, setIsReceivingUser] = useState(false); // New state for the switch
  const [expenseTypes, setExpenseTypes] = useRecoilState(expenseTypesState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddExpenseType = async () => {
    try {
      if (!expenseTypeName) {
        setError("Expense type name is required");
        return;
      }

      setIsLoading(true);

      // Call your API service to add a new expense type with isReceivingUser parameter
      const newExpenseType = await ExpenseTypesService.addExpenseType({
        name: expenseTypeName,
        isReceivingUser,
      });

      setExpenseTypes((prevExpenseTypes) => [
        ...prevExpenseTypes,
        newExpenseType,
      ]);
      navigation.goBack();
    } catch (error) {
      console.error("Error adding expense type:", error.response.data);
      setError(
        error.response.data?.error ||
          error.response?.data ||
          "An error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />

      <Input
        placeholder="Enter expense type name"
        value={expenseTypeName}
        onChangeText={setExpenseTypeName}
      />

      {/* Switch button for isReceivingUser */}
      <SwitchInput
        label="Is Receiving User"
        value={isReceivingUser}
        onValueChange={(value) => setIsReceivingUser(value)}
      />

      <Button title="Add Expense Type" onPress={handleAddExpenseType} />
    </View>
  );
};

export default AddExpenseTypeScreen;
