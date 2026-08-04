import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import DropDownPicker from "react-native-dropdown-picker";
import { TextInput, Text } from "react-native-paper";
import { DatePickerInput, TimePickerModal } from "react-native-paper-dates";

import {
  expenseTypesState,
  userState,
  expensesState,
  tagsState,
  usersState,
  workTypesState,
} from "../recoil/atom";
import ExpenseService from "../services/ExpenseService";
import { DateTime, Expense, ExpenseType, Tag as Tags, User } from "../types";
import CustomDropDown from "../components/common/CustomDropdown";
import commonAddScreenStyles from "../src/styles/commonAddScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import Button from "../components/common/Button";
import NumberInput from "../components/common/NumberInput";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import Modal from "../components/common/Modal";
import UserDropDownItem from "../components/common/UserDropDownItem";
import SwitchInput from "../components/common/SwitchInput";
import {
  ADD_EXPENSE_DIFFERENT_SENDER_LABEL,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AMOUNT_TO_RECEIVE_LESS_1,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AMOUNT_TO_RECEIVE_LESS_2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AMOUNT_TO_RECEIVE_LESS_3,
} from "../src/constants/labels";

interface AddExpenseScreenProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modalMessage, setModalMessage] = useState("");
  const [isAmountHoldingLess, setIsAmountHoldingLess] = useState(false);
  const [tags] = useRecoilState(tagsState);
  const [isEdit, setIsEdit] = useState(false);
  const [senderOpen, setSenderOpen] = useState(false);
  const [sender, setSender] = useState<string | null>(null);
  const [differentSender, setDifferentSender] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loggedInUser, setLoggedInUser] = useRecoilState(userState);
  const [receivers, setReceivers] = useState<User[]>([]);

  // Feature 04: WorkType and Purpose
  const workTypes = useRecoilValue(workTypesState);
  const [workTypeOpen, setWorkTypeOpen] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState<number | null>(null);
  const [purposeOpen, setPurposeOpen] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);

  const purposeOptions = [
    { label: "Advance (Peshgi)", value: "ADVANCE" },
    { label: "Ad-hoc (Fori)", value: "ADHOC" },
    { label: "Settlement (Hisaab)", value: "SETTLEMENT" },
  ];

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

  const timeFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [],
  );

  // Fetch users on component mount
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

      if (extractedExpense.workType) {
        setSelectedWorkType(extractedExpense.workType.id);
      }
      if (extractedExpense.paymentPurpose) {
        setSelectedPurpose(extractedExpense.paymentPurpose);
      }
    }
  }, [route.params?.isEditMode, route.params?.expense]);

  const maxFontSizeMultiplier = 1.5;
  const timeDate = new Date();
  time.hours !== undefined && timeDate.setHours(time.hours);
  time.minutes !== undefined && timeDate.setMinutes(time.minutes);

  // Handler for changing the selected expense type
  const handleExpenseTypeChange = () => {};

  // New handler for changing the selected tags
  const handleTagChange = () => {
    // Handle tag change logic if needed
  };

  const handleUserChange = (user: string | null) => {
    if (user) setSelectedUser(user);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setIsAmountHoldingLess(false); // Reset the isAmountHoldingLess state when the modal is closed
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
        workType: selectedWorkType
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ({ id: selectedWorkType, type: "work" } as any)
          : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paymentPurpose: selectedPurpose as any,
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

  // Handler for adding an expense
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

    if (
      selectedExpenseType?.name?.toLowerCase() === "accessories" &&
      !additionalInfo.trim()
    ) {
      setError("Additional details are mandatory for Accessories.");
      return;
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

  // Component rendering
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={commonAddScreenStyles.scrollViewContainer}
      >
        <LoadingError error={error} isLoading={isLoading} />

        <SwitchInput
          label={ADD_EXPENSE_DIFFERENT_SENDER_LABEL}
          value={differentSender}
          onValueChange={setDifferentSender}
        />

        {differentSender && (
          <CustomDropDown
            testID="sender-picker"
            schema={{
              label: "name",
              value: "id",
            }}
            zIndex={4000}
            zIndexInverse={4000}
            items={users}
            searchable={true}
            open={senderOpen}
            setOpen={setSenderOpen}
            containerStyle={{ height: 40, marginBottom: 16 }}
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
        )}
        <CustomDropDown
          items={expenseTypes}
          schema={{
            label: "name",
            value: "id",
          }}
          zIndex={3000}
          zIndexInverse={3000}
          searchable={true}
          open={open}
          setOpen={setOpen}
          containerStyle={{ height: 40, marginBottom: 16 }}
          value={value}
          setValue={setValue}
          itemSeparator={true}
          placeholder="Select Type (Mazori, Medical etc...)"
          onChangeValue={handleExpenseTypeChange}
          testID="expense-type-picker"
        />

        {/* Additional selector for users if required */}
        {value && isReceivingUser && (
          <CustomDropDown
            testID="user-picker"
            schema={{
              label: "name",
              value: "id",
            }}
            zIndex={2000}
            zIndexInverse={2000}
            items={receivers}
            searchable={true}
            open={userOpen}
            setOpen={setUserOpen}
            containerStyle={{ height: 40, marginBottom: 16 }}
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
        )}

        {/* Work Type selector — only show when expense has a receiving user */}
        {value && isReceivingUser && (
          <>
            <CustomDropDown
              testID="work-type-picker"
              schema={{ label: "name", value: "id" }}
              zIndex={1800}
              zIndexInverse={1800}
              items={workTypes}
              searchable={true}
              open={workTypeOpen}
              setOpen={setWorkTypeOpen}
              containerStyle={{ height: 40, marginBottom: 16 }}
              value={selectedWorkType}
              setValue={setSelectedWorkType}
              itemSeparator={true}
              placeholder="Against Work Type (optional)"
            />

            {selectedWorkType && (
              <CustomDropDown
                testID="purpose-picker"
                schema={{ label: "label", value: "value" }}
                zIndex={1600}
                zIndexInverse={1600}
                items={purposeOptions}
                open={purposeOpen}
                setOpen={setPurposeOpen}
                containerStyle={{ height: 40, marginBottom: 16 }}
                value={selectedPurpose}
                setValue={setSelectedPurpose}
                itemSeparator={true}
                placeholder="Purpose: Advance / Ad-hoc / Settlement"
              />
            )}
          </>
        )}

        {/* New selector for tags */}
        {!isReceivingUser && ( // Add this condition
          <CustomDropDown
            testID="tags-picker"
            multiple={true}
            items={tags}
            zIndex={1000}
            zIndexInverse={1000}
            schema={{
              label: "name",
              value: "id",
            }}
            open={tagOpen}
            setOpen={setTagOpen}
            containerStyle={{ height: 40, marginBottom: 16 }}
            value={selectedTags}
            setValue={setSelectedTags}
            itemSeparator={true}
            placeholder="Select Tags"
            onChangeValue={handleTagChange}
          />
        )}

        {/* Input fields for amount and additional information */}
        <NumberInput label="Amount" value={amount} onChangeText={setAmount} />

        <TextInput
          label="Additional information (optional)"
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          style={commonAddScreenStyles.inputField}
        />

        {/* Date picker */}
        <DatePickerInput
          locale="en"
          label="Expense date"
          value={inputDate}
          onChange={(d) => setInputDate(d || new Date())}
          inputMode="start"
          style={commonAddScreenStyles.inputField}
        />

        {/* Time picker */}
        <View
          style={[commonStyles.row, commonAddScreenStyles.marginVerticalEight]}
        >
          <View style={commonAddScreenStyles.section}>
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={commonAddScreenStyles.bold}
            >
              Time
            </Text>
            <Text maxFontSizeMultiplier={maxFontSizeMultiplier}>
              {time && time.hours !== undefined && time.minutes !== undefined
                ? timeFormatter.format(
                    new Date().setHours(time.hours, time.minutes),
                  )
                : `Current Time: ${timeFormatter.format(new Date())}`}
            </Text>
          </View>
          <Button
            icon={"clock"}
            onPress={() => setTimeOpen(true)}
            mode="contained-tonal"
            title={"Pick time"}
          />
        </View>

        {/* Time picker modal */}
        <TimePickerModal
          locale={"en"}
          visible={timeOpen}
          onDismiss={onDismissTime}
          onConfirm={onConfirmTime}
          hours={time.hours}
          minutes={time.minutes}
        />

        {/* Button to add the expense */}
        <Button
          icon={route.params?.isEditMode ? "update" : "credit-card-plus"}
          mode="contained"
          onPress={handleAddExpense}
          disabled={isLoading}
          title={route.params?.isEditMode ? "Update Expense" : "Add Expense"}
        />

        <Modal
          isModalVisible={modalVisible}
          setIsModalVisible={handleModalClose}
          contentContainerStyle={commonStyles.modalContainer}
        >
          <Text>{modalMessage}</Text>
          <View style={commonStyles.modalButtonGap} />
          <Button
            icon="check"
            mode="contained"
            onPress={submitExpense}
            title={"Continue"}
          />
          {isAmountHoldingLess && (
            <>
              <View style={commonStyles.modalButtonGap} />
              <Button
                icon="account-cog"
                mode="contained"
                onPress={navigateToManageAmounts}
                title={"Declare contribution"}
              />
            </>
          )}
          <View style={commonStyles.modalButtonGap} />
          <Button
            icon="cancel"
            mode="outlined"
            onPress={handleModalClose}
            title={"Cancel"}
          />
        </Modal>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default AddExpenseScreen;
