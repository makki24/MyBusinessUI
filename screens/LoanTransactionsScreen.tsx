// src/screens/LoanTransactionScreen.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { FAB, Snackbar } from "react-native-paper";
import { useRecoilState } from "recoil";
import LoanTransactionItem from "../components/LoanTransactionItem";
import { loanToHoldingTransactionState } from "../recoil/atom";
import { LoanToHoldingTransaction } from "../types";
import contributionService from "../services/ContributionService";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import ConfirmationModal from "../components/common/ConfirmationModal";

type LoanTransactionScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const LoanTransactionScreen: React.FC<LoanTransactionScreenProps> = ({
  navigation,
}) => {
  const [loanTransactions, setLoanTransactions] = useRecoilState(
    loanToHoldingTransactionState,
  );
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<LoanToHoldingTransaction>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const fetchLoanTransactions = async () => {
    try {
      setIsRefreshing(true);

      let transactionsData =
        await contributionService.getLoanClearTransactions();
      transactionsData = transactionsData.map((transaction) => ({
        ...transaction,
        date: new Date(transaction.date),
      }));
      setLoanTransactions(transactionsData);
    } catch (fetchError) {
      setError(
        fetchError.message ||
          "Error fetching loan transactions. Please try again.",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLoanTransactions();
  }, []);

  const handleRefresh = () => {
    fetchLoanTransactions();
  };

  const handleEditTransaction = (item: LoanToHoldingTransaction) => {
    const serializedDate = item.date.toISOString();

    navigation.navigate("ProfileStack", {
      screen: "ManageAmounts",
      params: {
        title: "Edit transaction",
        transaction: { ...item, date: serializedDate },
        isEditMode: true,
      },
    });
  };

  const handleDeleteTransaction = async (transaction) => {
    setSelectedTransaction(transaction);

    setIsDeleteModalVisible(true);
  };

  const confirmDeleteTransaction = async () => {
    setIsLoading(true);

    try {
      await contributionService.deleteLoanClearTransactions(
        selectedTransaction.id,
      );
      setSnackbarVisible(true);
      setLoanTransactions((prevTransactions) =>
        prevTransactions.filter(
          (transaction) => transaction.id !== selectedTransaction.id,
        ),
      );
    } catch (deleteError) {
      setError(
        deleteError.message ||
          "Error deleting loan transaction. Please try again.",
      );
    } finally {
      setIsLoading(false);
      setSelectedTransaction(null);
      setIsDeleteModalVisible(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />

      {!error && (
        <FlatList
          data={loanTransactions}
          renderItem={({ item }) => (
            <LoanTransactionItem
              onPress={() => handleEditTransaction(item)}
              onDelete={() => handleDeleteTransaction(item)}
              transaction={item}
              testID={`transaction-item-${item.id}`}
            />
          )}
          keyExtractor={(item) => item.id.toString()} // Ensure key is a string
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          testID="loan-transaction-list"
        />
      )}

      {/* Delete Transaction Modal */}
      <ConfirmationModal
        warningMessage={
          "Are you sure you want to delete this loan transaction?"
        }
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        onConfirm={confirmDeleteTransaction}
      />

      <FAB
        style={commonScreenStyles.fab}
        icon="plus"
        onPress={() =>
          navigation.navigate("ProfileStack", {
            screen: "ManageAmounts",
            params: { title: "Manage Amounts" },
          })
        }
        testID="add-transaction-fab"
      />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
        testID="snackbar"
      >
        Transaction deleted successfully!
      </Snackbar>
    </View>
  );
};

export default LoanTransactionScreen;
