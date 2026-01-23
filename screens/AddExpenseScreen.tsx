import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import DropDownPicker from "react-native-dropdown-picker";
import { TextInput, Text, useTheme, Divider } from "react-native-paper";
import { DatePickerInput, TimePickerModal } from "react-native-paper-dates";

import {
  expenseTypesState,
  userState,
  expensesState,
  tagsState,
  usersState,
} from "../recoil/atom";
import ExpenseService from "../services/ExpenseService";
import { DateTime, Expense, ExpenseType, Tag as Tags, User } from "../types";
import CustomDropDown from "../components/common/CustomDropdown";
import LoadingError from "../components/common/LoadingError";
import Button from "../components/common/Button";
import NumberInput from "../components/common/NumberInput";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import Modal from "../components/common/Modal";
import UserDropDownItem from "../components/common/UserDropDownItem";
import SwitchInput from "../components/common/SwitchInput";
import {
  ADD_EXPENSE_DIFFERENT_SENDER_LABEL,
  AMOUNT_TO_RECEIVE_LESS_1,
  AMOUNT_TO_RECEIVE_LESS_2,
  AMOUNT_TO_RECEIVE_LESS_3,
} from "../src/constants/labels";
import { UI_ELEMENTS_GAP, CONTAINER_PADDING } from "../src/styles/constants";

interface AddExpenseScreenProps {
  navigation: NavigationProp<ParamListBase>;
  route: {
    params: {
      isEditMode: boolean;
      expense: Expense;
    };
  };
}

DropDownPicker.setListMode("SCROLLVIEW");

const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({
  route,
  navigation,
}) => {
  const theme = useTheme();
  const [expenseTypes] = useRecoilState(expenseTypesState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [value, setValue] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [amount, setAmount] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [inputDate, setInputDate] = useState(new Date());
  const [time, setTime] = useState<DateTime>({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
  });
  const [timeOpen, setTimeOpen] = useState(false);
  const users = useRecoilValue(usersState);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isReceivingUser, setIsReceivingUser] = useState<boolean>(false);
  const [_, setExpenses] = useRecoilState(expensesState);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isAmountHoldingLess, setIsAmountHoldingLess] = useState(false);
  const [tags] = useRecoilState(tagsState);
  const [isEdit, setIsEdit] = useState(false);
  const [senderOpen, setSenderOpen] = useState(false);
  const [sender, setSender] = useState<string | null>(null);
  const [differentSender, setDifferentSender] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useRecoilState(userState);
  const [receivers, setReceivers] = useState<User[]>([]);

  const onConfirmTime = useCallback(
    ({ hours, minutes }: DateTime) => {
      setTimeOpen(false);
      setTime({ hours, minutes });
    },
    [setTimeOpen, setTime],
  );

  useEffect(() => {
    setReceivers(users);
  }, [users]);

  useEffect(() => {
    const selectedExpenseType = expenseTypes.find((type) => type.id === value);
    const isReceivingUserlocal = expenseTypes.some(
      (type) => type.id === value && type.isReceivingUser,
    );
    setSelectedUser(null);
    if (!selectedTags.length && selectedExpenseType)
      setSelectedTags(
        selectedExpenseType.defaultTags.map((selectedTag) => selectedTag.id),
      );
    if (isReceivingUserlocal) {
      setSelectedTags([]);
    }
    setIsReceivingUser(isReceivingUserlocal);
    if (
      route.params?.isEditMode &&
      route.params?.expense &&
      isReceivingUserlocal
    )
      setSelectedUser(
        route.params.expense.receiver ? route.params.expense.receiver.id : null,
      );
  }, [value]);

  const onDismissTime = useCallback(() => {
    setTimeOpen(false);
  }, [setTimeOpen]);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [],
  );

  useEffect(() => {
    if (route.params?.isEditMode && route.params?.expense) {
      setIsEdit(true);
      const extractedExpense = route.params.expense;
      const paramDate = new Date(extractedExpense.date);

      setValue(extractedExpense.type.id);
      setAmount(`${extractedExpense.amount}`);
      setAdditionalInfo(extractedExpense.description);
      setSelectedTags(extractedExpense.tags.map((tag) => tag.id));
      setInputDate(paramDate);
      setValue(extractedExpense.type.id);
      setIsReceivingUser(!!extractedExpense.receiver);
      setTime({ hours: paramDate.getHours(), minutes: paramDate.getMinutes() });
      setSender(extractedExpense.sender.id);
      if (loggedInUser.id !== extractedExpense.sender.id)
        setDifferentSender(true);
    }
  }, [route.params?.isEditMode, route.params?.expense]);

  const handleUserChange = (user: string | null) => {
    if (user) setSelectedUser(user);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setIsAmountHoldingLess(false);
  };

  const submitExpense = async () => {
    try {
      setModalVisible(false);
      setIsLoading(true);
      const expenseDate = new Date(inputDate);
      expenseDate.setHours(time.hours, time.minutes);

      let newExpense: Expense = {
        date: expenseDate,
        type: { id: value, type: "expense" } as ExpenseType,
        amount: parseFloat(amount),
        description: additionalInfo,
        sender: differentSender ? ({ id: sender } as User) : loggedInUser,
        receiver: selectedUser ? ({ id: selectedUser } as User) : null,
        tags: selectedTags.map((tag) => ({ id: tag })) as Tags[],
      };
      if (isEdit) newExpense.id = route.params.expense.id;

      newExpense = await ExpenseService.addExpense(newExpense);

      newExpense.date = new Date(newExpense.date);

      setExpenses((prevExpenses) => [
        newExpense,
        ...prevExpenses.filter(
          (expenseItem) => expenseItem.id !== newExpense.id,
        ),
      ]);

      setAmount("");
      setValue(null);
      setAdditionalInfo("");
      setLoggedInUser((currVal: User) => {
        let amountHolding = currVal.amountHolding - parseFloat(amount);
        let amountToReceive = currVal.amountToReceive;
        if (amountHolding < 0) {
          amountHolding = currVal.amountHolding;
          amountToReceive = currVal.amountToReceive + parseFloat(amount);
        }
        return { ...currVal, amountHolding, amountToReceive };
      });

      navigation.goBack();
    } catch (err) {
      setError(
        err.response?.data ??
        err.message ??
        "An error occurred while adding the expense",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async () => {
    setError("");
    if (!value || !amount) {
      setError("Expense type and amount are required");
      return;
    }

    if (value.toString() === "others" && !additionalInfo) {
      setError("Additional info is required for others expenses");
      return;
    }

    const selectedExpenseType = expenseTypes.find((type) => type.id === value);

    if (!selectedExpenseType) {
      setError("Invalid expense type selected");
      return;
    }

    if (selectedExpenseType?.isReceivingUser && !selectedUser) {
      setError("Please select a user for this expense type.");
      return;
    }

    if (isReceivingUser) {
      const receivingUser = users.filter((user) => user.id === selectedUser)[0];
      const loan = receivingUser.amountToReceive - receivingUser.amountHolding;
      if (parseFloat(amount) > loan) {
        setModalMessage(
          ` ${AMOUNT_TO_RECEIVE_LESS_1} ${receivingUser.name}  (${amount}) ${AMOUNT_TO_RECEIVE_LESS_2} (${loan}). ${AMOUNT_TO_RECEIVE_LESS_3}`,
        );
        setModalVisible(true);
        return;
      }
    }

    submitExpense();
  };

  const navigateToManageAmounts = () => {
    setModalVisible(false);
    navigation.navigate("ProfileStack", {
      screen: "AddContribution",
      params: { title: "Add Contribution" },
    });
  };

  const onSenderChange = (user) => {
    setReceivers(users.filter((receiver) => receiver.id !== user));
  };

  // Dynamic styles based on theme
  const dynamicStyles = useMemo(() => ({
    scrollView: { backgroundColor: theme.colors.background },
    sectionCard: { backgroundColor: theme.colors.surface },
    sectionTitle: { color: theme.colors.primary },
    fieldLabel: { color: theme.colors.onSurfaceVariant },
    timeText: { color: theme.colors.onSurface },
  }), [theme]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollViewContainer, dynamicStyles.scrollView]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <LoadingError error={error} isLoading={isLoading} />

        {/* Sender Section - NO Surface wrapper to allow dropdown overlay */}
        <View style={[styles.sectionCard, dynamicStyles.sectionCard, { zIndex: 5000 }]}>
          <Text variant="labelLarge" style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            SENDER OPTIONS
          </Text>
          <Divider style={styles.sectionDivider} />

          <SwitchInput
            label={ADD_EXPENSE_DIFFERENT_SENDER_LABEL}
            value={differentSender}
            onValueChange={setDifferentSender}
          />

          {differentSender && (
            <View style={{ zIndex: 4000 }}>
              <CustomDropDown
                testID="sender-picker"
                schema={{ label: "name", value: "id" }}
                zIndex={4000}
                zIndexInverse={1000}
                items={users}
                searchable={true}
                open={senderOpen}
                setOpen={setSenderOpen}
                containerStyle={styles.dropdownContainer}
                value={sender}
                setValue={setSender}
                itemSeparator={true}
                placeholder="Select Sender"
                onChangeValue={onSenderChange}
                renderListItem={({ item }) => (
                  <UserDropDownItem
                    item={item}
                    setSelectedUser={setSender}
                    selectedUser={sender}
                    setUserOpen={setSenderOpen}
                  />
                )}
              />
            </View>
          )}
        </View>

        {/* Expense Type Section */}
        <View style={[styles.sectionCard, dynamicStyles.sectionCard, { zIndex: 4000 }]}>
          <Text variant="labelLarge" style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            EXPENSE DETAILS
          </Text>
          <Divider style={styles.sectionDivider} />

          {/* Expense Type Dropdown */}
          <View style={{ zIndex: 3000, marginBottom: UI_ELEMENTS_GAP }}>
            <Text variant="labelMedium" style={[styles.fieldLabel, dynamicStyles.fieldLabel]}>
              Expense Type *
            </Text>
            <CustomDropDown
              items={expenseTypes}
              schema={{ label: "name", value: "id" }}
              zIndex={3000}
              zIndexInverse={2000}
              searchable={true}
              open={open}
              setOpen={setOpen}
              containerStyle={styles.dropdownContainer}
              value={value}
              setValue={setValue}
              itemSeparator={true}
              placeholder="Select Type (Mazori, Medical etc...)"
              testID="expense-type-picker"
            />
          </View>

          {/* User Dropdown - only shown when needed */}
          {value && isReceivingUser && (
            <View style={{ zIndex: 2000, marginBottom: UI_ELEMENTS_GAP }}>
              <Text variant="labelMedium" style={[styles.fieldLabel, dynamicStyles.fieldLabel]}>
                Select User *
              </Text>
              <CustomDropDown
                testID="user-picker"
                schema={{ label: "name", value: "id" }}
                zIndex={2000}
                zIndexInverse={3000}
                items={receivers}
                searchable={true}
                open={userOpen}
                setOpen={setUserOpen}
                containerStyle={styles.dropdownContainer}
                value={selectedUser}
                setValue={handleUserChange}
                itemSeparator={true}
                placeholder="Select User"
                onChangeValue={handleUserChange}
                renderListItem={({ item }) => (
                  <UserDropDownItem
                    item={item}
                    setSelectedUser={setSelectedUser}
                    selectedUser={selectedUser}
                    setUserOpen={setUserOpen}
                  />
                )}
              />
            </View>
          )}

          {/* Tags Dropdown */}
          {!isReceivingUser && (
            <View style={{ zIndex: 1000 }}>
              <Text variant="labelMedium" style={[styles.fieldLabel, dynamicStyles.fieldLabel]}>
                Tags
              </Text>
              <CustomDropDown
                testID="tags-picker"
                multiple={true}
                items={tags}
                zIndex={1000}
                zIndexInverse={4000}
                schema={{ label: "name", value: "id" }}
                open={tagOpen}
                setOpen={setTagOpen}
                containerStyle={styles.dropdownContainer}
                value={selectedTags}
                setValue={setSelectedTags}
                itemSeparator={true}
                placeholder="Select Tags"
              />
            </View>
          )}
        </View>

        {/* Amount Section - Lower z-index since no dropdowns */}
        <View style={[styles.sectionCard, dynamicStyles.sectionCard, { zIndex: 100 }]}>
          <Text variant="labelLarge" style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            AMOUNT & DETAILS
          </Text>
          <Divider style={styles.sectionDivider} />

          <View style={styles.fieldContainer}>
            <NumberInput
              label="Amount *"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <TextInput
            label="Additional information (optional)"
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            style={styles.textInput}
            mode="outlined"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Date & Time Section */}
        <View style={[styles.sectionCard, dynamicStyles.sectionCard, { zIndex: 50 }]}>
          <Text variant="labelLarge" style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            DATE & TIME
          </Text>
          <Divider style={styles.sectionDivider} />

          <View style={styles.fieldContainer}>
            <DatePickerInput
              locale="en"
              label="Expense date"
              value={inputDate}
              onChange={(d) => setInputDate(d || new Date())}
              inputMode="start"
              style={styles.textInput}
              mode="outlined"
            />
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeInfo}>
              <Text variant="labelMedium" style={dynamicStyles.fieldLabel}>
                Time
              </Text>
              <Text variant="headlineSmall" style={[dynamicStyles.timeText, { fontWeight: "600" }]}>
                {time && time.hours !== undefined && time.minutes !== undefined
                  ? timeFormatter.format(new Date().setHours(time.hours, time.minutes))
                  : timeFormatter.format(new Date())}
              </Text>
            </View>
            <Button
              icon="clock-outline"
              onPress={() => setTimeOpen(true)}
              mode="contained-tonal"
              title="Pick time"
            />
          </View>
        </View>

        <TimePickerModal
          locale="en"
          visible={timeOpen}
          onDismiss={onDismissTime}
          onConfirm={onConfirmTime}
          hours={time.hours}
          minutes={time.minutes}
        />

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            icon={route.params?.isEditMode ? "check-circle" : "plus-circle"}
            mode="contained"
            onPress={handleAddExpense}
            disabled={isLoading}
            title={route.params?.isEditMode ? "Update Expense" : "Add Expense"}
          />
        </View>

        <Modal
          isModalVisible={modalVisible}
          setIsModalVisible={handleModalClose}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalText}>{modalMessage}</Text>
          <View style={styles.modalButtonGap} />
          <Button icon="check" mode="contained" onPress={submitExpense} title="Continue" />
          {isAmountHoldingLess && (
            <>
              <View style={styles.modalButtonGap} />
              <Button
                icon="account-cog"
                mode="contained"
                onPress={navigateToManageAmounts}
                title="Declare contribution"
              />
            </>
          )}
          <View style={styles.modalButtonGap} />
          <Button icon="close" mode="outlined" onPress={handleModalClose} title="Cancel" />
        </Modal>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    padding: CONTAINER_PADDING,
    paddingBottom: 40,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.5,
    fontSize: 12,
  },
  sectionDivider: {
    marginBottom: 12,
  },
  fieldContainer: {
    marginBottom: UI_ELEMENTS_GAP,
  },
  fieldLabel: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  dropdownContainer: {
    height: 48,
    marginBottom: 8,
  },
  textInput: {
    marginBottom: UI_ELEMENTS_GAP,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  timeInfo: {
    flex: 1,
  },
  submitContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  modalContainer: {
    padding: CONTAINER_PADDING,
    borderRadius: 16,
    alignSelf: "center",
    width: "85%",
  },
  modalText: {
    marginBottom: 8,
    lineHeight: 22,
  },
  modalButtonGap: {
    height: 12,
  },
});

export default AddExpenseScreen;
