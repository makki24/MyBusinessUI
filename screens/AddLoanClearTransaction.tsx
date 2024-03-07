import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Button, Text, Snackbar } from "react-native-paper";
import { useRecoilState } from "recoil";
import {
  loanToHoldingTransactionState,
  usersState,
  userState,
} from "../recoil/atom";
import CustomDropDown from "../components/common/CustomDropdown";
import UserDropDownItem from "../components/common/UserDropDownItem";
import { LoanToHoldingTransaction, User } from "../types";
import contributionService from "../services/ContributionService";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import NumberInput from "../components/common/NumberInput";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

interface AddLoanClearTransactionProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
  route: {
    params: {
      isEditMode: boolean;
      transaction: LoanToHoldingTransaction;
    };
  };
}

const AddLoanClearTransaction: React.FC<AddLoanClearTransactionProps> = ({
  route,
}) => {
  const [amountToTransfer, setAmountToTransfer] = useState("");
  const [loggedInUser] = useRecoilState(userState);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers] = useRecoilState(usersState);
  const [userOpen, setUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(
    loggedInUser.id,
  );
  const [displayUser, setDisplayUser] = useState<User>(loggedInUser);
  const [_, setLoanTransactions] = useRecoilState(
    loanToHoldingTransactionState,
  );
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    const userToDisplay = selectedUser
      ? allUsers.find((user) => user.id === selectedUser)
      : loggedInUser;
    setDisplayUser(userToDisplay);
  }, [selectedUser]);

  useEffect(() => {
    if (route.params?.isEditMode && route.params?.transaction) {
      const selectedTransaction: LoanToHoldingTransaction =
        route.params.transaction;
      setAmountToTransfer(`${selectedTransaction.amount}`);
      setSelectedUser(selectedTransaction.user.id);
    }
  }, [route.params?.isEditMode, route.params?.transaction]);

  const submitTransfer = async () => {
    setError("");
    try {
      setIsLoading(true);
      const currentDate = new Date();
      currentDate.setSeconds(currentDate.getSeconds() - 1);
      const transaction: LoanToHoldingTransaction = {
        createdBy: loggedInUser,
        user: selectedUser ? ({ id: selectedUser } as User) : loggedInUser,
        date: currentDate,
        amount: parseFloat(amountToTransfer),
      };
      if (route.params?.isEditMode && route.params?.transaction) {
        transaction.id = route.params.transaction.id;
      }
      const response =
        await contributionService.createOrUpdateLoanTransactions(transaction);
      transaction.id = response.id;
      setLoanTransactions((prevTransactions) => [
        ...prevTransactions.filter(
          (prevTransaction) => prevTransaction.id !== transaction.id,
        ),
        transaction,
      ]);
      //set logged in user

      setAmountToTransfer("");
      setSnackbarVisible(true);
    } catch (error) {
      setError(error.message ?? "An error occurred while updating the amount");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferAmount = async () => {
    const userSelected = allUsers.filter((user) => user.id === selectedUser)[0];
    if (
      parseFloat(amountToTransfer) > userSelected.amountToReceive &&
      parseFloat(amountToTransfer) > userSelected.amountHolding
    ) {
      setError(
        "The transfer amount cannot be greater than the amount to receive or amount holding.",
      );
      return;
    }
    submitTransfer();
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <LoadingError error={error} isLoading={isLoading} />
        <CustomDropDown
          schema={{
            label: "name",
            value: "id",
          }}
          zIndex={2000}
          zIndexInverse={2000}
          items={allUsers.filter((user) => user.phoneNumber || user.email)}
          searchable={true}
          open={userOpen}
          setOpen={setUserOpen}
          containerStyle={{ height: 40, marginBottom: 16 }}
          value={selectedUser}
          setValue={setSelectedUser}
          itemSeparator={true}
          placeholder="Select User"
          renderListItem={({ item }) => (
            <UserDropDownItem
              item={item}
              setSelectedUser={setSelectedUser}
              selectedUser={selectedUser}
              setUserOpen={setUserOpen}
            />
          )}
        />

        {displayUser && (
          <Text>Amount to Receive: {displayUser.amountToReceive}</Text>
        )}
        <Text style={{ marginBottom: 5 }}>
          Amount Holding: {displayUser.amountHolding}
        </Text>

        <NumberInput
          label="Amount to Transfer"
          value={amountToTransfer}
          onChangeText={setAmountToTransfer}
        />

        <Button
          icon="arrow-right"
          mode="contained"
          onPress={handleTransferAmount}
        >
          Transfer to clear loan
        </Button>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          action={{
            label: "OK",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          Transaction created successfully!
        </Snackbar>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1, // Allow the content to grow within the ScrollView
  },
});

export default AddLoanClearTransaction;
