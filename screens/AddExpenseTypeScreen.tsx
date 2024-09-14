// src/screens/AddExpenseTypeScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useRecoilState } from "recoil";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import ExpenseTypesService from "../services/ExpenseTypesService"; // Adjust the path accordingly
import { expenseTypesState } from "../recoil/atom"; // Adjust the path accordingly
import SwitchInput from "../components/common/SwitchInput";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { ExpenseType, Tag, Tag as Tags } from "../types";
import TagsSelectorButton from "../src/components/common/TagsSelectorButton";
import { makeEventNotifier } from "../src/components/common/useEventListner";

interface AddExpenseTypeScreenProps {
  route: {
    params: {
      expenseType: ExpenseType;
      isEditMode: boolean;
    };
  };
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
}

const AddExpenseTypeScreen: React.FC<AddExpenseTypeScreenProps> = ({
  route,
  navigation,
}) => {
  const [expenseTypeName, setExpenseTypeName] = useState("");
  const [isReceivingUser, setIsReceivingUser] = useState(false); // New state for the switch
  const [_, setExpenseTypes] = useRecoilState(expenseTypesState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tags[]>([]);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    // Check if the screen is in edit mode and workType data is provided
    if (route.params?.isEditMode && route.params?.expenseType) {
      setIsEdit(true);
      const expenseType = route.params.expenseType;
      setExpenseTypeName(expenseType.name);
      setIsReceivingUser(expenseType.isReceivingUser);
      setSelectedTags(expenseType.defaultTags);
    }
  }, [route.params?.isEditMode, route.params?.expenseType]);

  const handleAddExpenseType = async () => {
    try {
      if (!expenseTypeName) {
        setError("Expense type name is required");
        return;
      }

      setIsLoading(true);

      let newExpenseType: ExpenseType = {
        name: expenseTypeName,
        type: "expense",
        isReceivingUser,
        defaultTags: selectedTags,
      };

      if (isEdit) {
        newExpenseType.id = route.params.expenseType.id;
      }

      // Call your API service to add a new expense type with isReceivingUser parameter
      newExpenseType = await ExpenseTypesService.addExpenseType(newExpenseType);

      setExpenseTypes((prevExpenseTypes) => [
        ...prevExpenseTypes.filter(
          (expenseType) => expenseType.id !== newExpenseType.id,
        ),
        newExpenseType,
      ]);
      navigation.goBack();
    } catch (addError) {
      setError(
        addError.response.data?.error ||
          addError.response?.data ||
          "An error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const tagsSelectedNotifier = useRef(
    makeEventNotifier<{ tags: Tag[] }, unknown>(
      "OnTagsSelectedAndClosedInAddExpenseTypeScreen",
    ),
  ).current;

  const tagsSelectedListner = ({ tags }) => {
    setSelectedTags(tags);
  };

  tagsSelectedNotifier.useEventListener(tagsSelectedListner, []);

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />
      <TagsSelectorButton
        selectedTags={selectedTags}
        notifyId={tagsSelectedNotifier.name}
      />
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
