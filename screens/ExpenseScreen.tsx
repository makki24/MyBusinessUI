// src/screens/ExpenseScreen.tsx
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import ExpenseService from "../services/ExpenseService";
import ExpenseItem from "../components/ExpenseItem";
import { expensesState, userState } from "../recoil/atom";
import { Expense, Filter } from "../types";
import commonStyles from "../src/styles/commonStyles";
import expenseService from "../services/ExpenseService";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import ConfirmationModal from "../components/common/ConfirmationModal";
import * as Notifications from "expo-notifications";
import { PushNotificationTrigger } from "expo-notifications/src/Notifications.types";
import filterService from "../src/service/FilterService";
import ItemsList from "../src/components/common/ItemsList";
import LoadingError from "../components/common/LoadingError";
import { DEFAULT_SORT } from "../src/constants/filter";

type ExpenseScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const ExpenseScreen: React.FC<ExpenseScreenProps> = ({ navigation }) => {
  const [expenses, setExpenses] = useRecoilState(expensesState);
  const loggedInUser = useRecoilValue(userState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [uniqueFilters, setUniqueFilters] = useState<Filter>({
    sender: [],
    receiver: [],
    tags: [],
    user: [],
  });
  const defaultSort = DEFAULT_SORT; // Use a state variable

  // Check if user can delete expenses
  const isAdmin = loggedInUser?.roles?.some((role) => role.name === "ADMIN");

  const canDeleteExpense = (expense: Expense): boolean => {
    return isAdmin || expense.sender?.id === loggedInUser?.id;
  };

  const transFormAndSetExpense = (expensesData: Expense[]) => {
    setExpenses(transformedData(expensesData));
  };

  const transformedData = (itemsData) =>
    itemsData.map((expense) => ({
      ...expense,
      date: new Date(expense.date),
    }));

  useEffect(() => {
    if (error) setExpenses([]);
  }, [error]);

  const getUnique = async () => {
    const uniQueFilter = await filterService.getExpenseFilters();
    setUniqueFilters(uniQueFilter);
  };

  useEffect(() => {
    let isMounted = true;
    getUnique();
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return;
      }

      const filterAsString = (
        response?.notification.request.trigger as PushNotificationTrigger
      ).remoteMessage?.data.expenseFilter;

      try {
        const filter = JSON.parse(filterAsString);
        const filterDate = filter.lastUpdateTime;
        const offset = new Date().getTimezoneOffset();
        const date = new Date(
          filterDate.year,
          filterDate.monthValue - 1,
          filterDate.dayOfMonth,
          filterDate.hour,
          filterDate.minute,
          filterDate.second,
        );

        filter.lastUpdateTime = new Date(date.getTime() - offset * 60 * 1000);
        setIsLoading(true);
        onApply(filter);
      } catch (err) {
        err;
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEditExpense = (expense: Expense) => {
    const serializedDate = expense.date.toISOString();

    navigation.navigate("ExpenseStack", {
      screen: "AddExpense",
      params: {
        title: `Edit Expense`,
        expense: { ...expense, date: serializedDate },
        isEditMode: true,
      },
    });
  };

  const handleDeleteExpense = async (expense) => {
    setSelectedExpense(expense);

    setIsDeleteModalVisible(true);
  };

  const confirmDeleteExpense = async () => {
    setIsLoading(true);

    try {
      await ExpenseService.deleteExpense(selectedExpense.id);
      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== selectedExpense.id),
      );
    } catch (deleteError) {
      setError(
        deleteError.response?.data ||
          "Error deleting expense. Please try again.",
      );
    } finally {
      setIsLoading(false);
      setSelectedExpense(null);
      setIsDeleteModalVisible(false);
    }
  };

  const handleSearch = (_arg) => {
    return expenses;
  };

  const onApply = async (arg: Filter) => {
    setError("");
    setIsLoading(true);
    try {
      const filteredExpenses = await expenseService.filterExpense({
        filter: arg,
        sort: defaultSort,
      });
      transFormAndSetExpense(filteredExpenses);
    } catch (e) {
      setError(e.message || "Error setting filters.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />
      <ItemsList
        uniQueFilterValues={uniqueFilters}
        searchBar={false}
        sort={true}
        handleSearch={handleSearch}
        fetchData={expenseService.filterExpense}
        recoilState={expensesState}
        renderItem={({ item }) => (
          <ExpenseItem
            expense={item}
            onPress={() => handleEditExpense(item)}
            onDelete={() => handleDeleteExpense(item)}
            canDelete={canDeleteExpense(item)}
          />
        )}
        transFormData={transformedData}
        onAdd={() => {
          navigation.navigate("ExpenseStack", {
            screen: "AddExpense",
            params: { title: "Add Expense" },
          });
        }}
      />
      <ConfirmationModal
        warningMessage={"Are you sure you want to delete this expense?"}
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        onConfirm={confirmDeleteExpense}
      />
    </View>
  );
};

export default ExpenseScreen;
