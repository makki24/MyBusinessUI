import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { FAB, Snackbar } from "react-native-paper";
import { useRecoilState } from "recoil";
import { expenseTypesState } from "../recoil/atom";
import ExpenseTypesService from "../services/ExpenseTypesService";
import ExpenseTypeItem from "../components/ExpenseTypeItem";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import ConfirmationModal from "../components/common/ConfirmationModal";

type ExpenseTypesScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const ExpenseTypesScreen: React.FC<ExpenseTypesScreenProps> = ({
  navigation,
}) => {
  const [expenseTypes, setExpenseTypes] = useRecoilState(expenseTypesState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const fetchExpenseTypes = async () => {
    try {
      setIsRefreshing(true);

      const expenseTypesData = await ExpenseTypesService.getExpenseTypes();
      setExpenseTypes(expenseTypesData);
      setError(null); // Clear any previous errors
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.error ??
          (fetchError.response?.data ||
            "Error fetching expense types. Please try again."),
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  const handleEditExpenseType = (expenseType) => {
    navigation.navigate("ExpenseTypeStack", {
      screen: "AddExpenseType",
      params: { title: "Edit Expense Type", expenseType, isEditMode: true },
    });
  };

  const handleDeleteExpenseType = (expenseType) => {
    setSelectedExpenseType(expenseType);
    setIsDeleteModalVisible(true);
  };

  const confirmDeleteExpenseType = async () => {
    setIsLoading(true);

    try {
      await ExpenseTypesService.deleteExpenseType(selectedExpenseType.id);
      setExpenseTypes((prevExpenseTypes) =>
        prevExpenseTypes.filter(
          (expenseType) => expenseType.id !== selectedExpenseType.id,
        ),
      );
      setSnackbarVisible(true);
    } catch (deleteExpenseError) {
      setError(
        deleteExpenseError.response?.data ||
          "Error deleting expense type. Please try again.",
      );
    } finally {
      setIsLoading(false);
      setSelectedExpenseType(null);
      setIsDeleteModalVisible(false);
    }
  };

  const handleRefresh = () => {
    fetchExpenseTypes();
  };

  const onSnackbarDismiss = () => {
    setSnackbarVisible(false);
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />

      {!error && (
        <FlatList
          data={expenseTypes}
          renderItem={({ item }) => (
            <ExpenseTypeItem
              expenseType={item}
              onPress={() => handleEditExpenseType(item)}
              onDelete={() => handleDeleteExpenseType(item)}
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
        onPress={() => navigation.navigate("AddExpenseType")}
      />

      {/* Delete ExpenseType Modal */}
      <ConfirmationModal
        warningMessage={"Are you sure you want to delete this expense type?"}
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        onConfirm={confirmDeleteExpenseType}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={onSnackbarDismiss}
        duration={3000}
      >
        Expense type deleted successfully
      </Snackbar>
    </View>
  );
};

export default ExpenseTypesScreen;
