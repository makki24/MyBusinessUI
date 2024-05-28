// src/screens/ExpenseScreen.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { FAB, IconButton, Tooltip } from "react-native-paper";
import { useRecoilState } from "recoil";
import ExpenseService from "../services/ExpenseService";
import ExpenseItem from "../components/ExpenseItem";
import { expensesState } from "../recoil/atom";
import { Expense, Filter, Sort, User } from "../types";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import SearchAndFilter from "../components/common/SearchAndFilter";
import expenseService from "../services/ExpenseService";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import ConfirmationModal from "../components/common/ConfirmationModal";
import * as Notifications from "expo-notifications";
import { PushNotificationTrigger } from "expo-notifications/src/Notifications.types";

type ExpenseScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const ExpenseScreen: React.FC<ExpenseScreenProps> = ({ navigation }) => {
  const [expenses, setExpenses] = useRecoilState(expensesState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [senders, setSenders] = useState<User[]>([]);
  const [receivers, setReceivers] = useState<User[]>([]);
  const today = new Date();
  const tomorrow = new Date();
  const initialFilter = {
    fromDate: new Date(today.setDate(today.getDate() - 7)),
    toDate: new Date(tomorrow.setDate(tomorrow.getDate() + 1)),
    sender: [],
    receiver: [],
    tags: [],
    user: [],
  };
  const [defaultFilter, setDefaultFilter] = useState<Filter | null>(
    initialFilter,
  ); // Use a state variable
  const [defaultSort, setDefaultSort] = useState<Sort[]>([
    {
      property: "date",
      direction: "desc",
    },
  ]); // Use a state variable

  const transFormAndSetExpense = (expensesData: Expense[]) => {
    expensesData = expensesData.map((expense) => ({
      ...expense,
      date: new Date(expense.date),
    }));
    setExpenses(expensesData);
  };

  const fetchExpenses = async () => {
    try {
      const expensesData = await ExpenseService.getExpenses();
      const sendersSet: User[] = [];
      const receiverSet: User[] = [];
      expensesData.forEach((expn) => {
        if (
          expn.sender &&
          !sendersSet.find((user) => user.id === expn.sender.id)
        )
          sendersSet.push(expn.sender);
        if (
          expn.receiver &&
          !receiverSet.find((user) => user.id === expn.receiver.id)
        )
          receiverSet.push(expn.receiver);
      });
      setSenders(sendersSet);
      setReceivers([...receiverSet]);
    } catch (fetchError) {
      setError(
        fetchError.response?.data ||
          "Error fetching expenses. Please try again.",
      );
    }
  };

  useEffect(() => {
    if (error) setExpenses([]);
  }, [error]);

  useEffect(() => {
    let isMounted = true;

    fetchExpenses();
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return;
      }

      const filterAsString = (
        response?.notification.request.trigger as PushNotificationTrigger
      ).remoteMessage.data.expenseFilter;

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

        onApply(filter);
      } catch (err) {
        err;
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    onApply(defaultFilter);
  }, [defaultSort]);

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

  const handleRefresh = () => {
    fetchExpenses();
    onApply(defaultFilter);
  };

  const handleSearch = () => {};

  const onApply = async (arg: Filter) => {
    setError("");
    setDefaultFilter(arg);
    setIsRefreshing(true);
    try {
      const filteredExpenses = await expenseService.filterExpense({
        filter: arg,
        sort: defaultSort,
      });
      transFormAndSetExpense(filteredExpenses);
    } catch (e) {
      setError(e.message || "Error setting filters.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.simpleRow}>
        <SearchAndFilter
          searchBar={false}
          sort={true}
          handleSearch={handleSearch}
          sender={senders}
          receiver={receivers}
          onApply={onApply}
          defaultFilter={defaultFilter}
          appliedSort={defaultSort}
          setSort={setDefaultSort}
        />
        <Tooltip title="Restore to Default">
          <IconButton
            icon={"lock-reset"}
            mode={"contained"}
            onPress={() => {
              onApply(initialFilter);
            }}
          />
        </Tooltip>
      </View>
      {
        <FlatList
          data={expenses}
          ListHeaderComponent={() => (
            <View>
              <LoadingError error={error} isLoading={isLoading} />
            </View>
          )}
          renderItem={({ item }) => (
            <ExpenseItem
              expense={item}
              onPress={() => handleEditExpense(item)}
              onDelete={() => handleDeleteExpense(item)}
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
      }

      <FAB
        style={commonScreenStyles.fab}
        icon="plus"
        testID={"addExpense"}
        onPress={() => {
          navigation.navigate("ExpenseStack", {
            screen: "AddExpense",
            params: { title: "Add Expense" },
          });
          navigation.navigate("AddExpense");
        }}
      />

      {/* Delete Expense Modal */}
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
