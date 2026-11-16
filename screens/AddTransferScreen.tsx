import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import { Text, TextInput, Avatar, Chip, useTheme } from "react-native-paper";
import { DatePickerInput, TimePickerModal } from "react-native-paper-dates";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

import {
  expenseTypesState,
  userState,
  expensesState,
  usersState,
  workTypesState,
} from "../recoil/atom";
import ExpenseService from "../services/ExpenseService";
import { DateTime, Expense, ExpenseType, User } from "../types";
import CustomDropDown from "../components/common/CustomDropdown";
import UserDropDownItem from "../components/common/UserDropDownItem";
import commonAddScreenStyles from "../src/styles/commonAddScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import Button from "../components/common/Button";

type TransferMode = "RECEIVED" | "PAID" | "OTHER";

interface AddTransferScreenProps {
  navigation: NavigationProp<ParamListBase>;
  route?: {
    params?: {
      senderId?: string;
      receiverId?: string;
      direction?: TransferMode;
      amount?: string;
    };
  };
}

const AddTransferScreen: React.FC<AddTransferScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const loggedInUser = useRecoilValue(userState);
  const users = useRecoilValue(usersState);
  const expenseTypes = useRecoilValue(expenseTypesState);
  const workTypes = useRecoilValue(workTypesState);
  const [, setExpenses] = useRecoilState(expensesState);

  // Direction Mode: RECEIVED (I received), PAID (I sent), OTHER (Between others)
  const initialMode: TransferMode = route?.params?.direction || "RECEIVED";
  const [mode, setMode] = useState<TransferMode>(initialMode);

  // Form State
  const [senderId, setSenderId] = useState<string | null>(
    route?.params?.senderId || null,
  );
  const [receiverId, setReceiverId] = useState<string | null>(
    route?.params?.receiverId || loggedInUser?.id || null,
  );
  const [amount, setAmount] = useState<string>(route?.params?.amount || "");
  const [description, setDescription] = useState<string>("");
  const [inputDate, setInputDate] = useState<Date>(new Date());
  const [time, setTime] = useState<DateTime>({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
  });
  const [timeOpen, setTimeOpen] = useState(false);

  // Dropdown open states
  const [senderOpen, setSenderOpen] = useState(false);
  const [receiverOpen, setReceiverOpen] = useState(false);
  const [workTypeOpen, setWorkTypeOpen] = useState(false);
  const [purposeOpen, setPurposeOpen] = useState(false);

  // Work type & Purpose
  const [selectedWorkType, setSelectedWorkType] = useState<number | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);

  // Loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional details toggle
  const [showDetails, setShowDetails] = useState(false);

  const purposeOptions = [
    { label: "Advance (Peshgi)", value: "ADVANCE" },
    { label: "Ad-hoc (Fori)", value: "ADHOC" },
    { label: "Settlement (Hisaab)", value: "SETTLEMENT" },
  ];

  // Transfer expense type resolution
  const transferType = useMemo(
    () =>
      expenseTypes.find(
        (t: ExpenseType) =>
          t.name?.toLowerCase().includes("transfer") ||
          t.name?.toLowerCase().includes("Transfer"),
      ),
    [expenseTypes],
  );

  // Initialize sender/receiver based on mode
  useEffect(() => {
    if (mode === "RECEIVED") {
      setReceiverId(loggedInUser?.id || null);
      if (senderId === loggedInUser?.id) {
        setSenderId(null);
      }
    } else if (mode === "PAID") {
      setSenderId(loggedInUser?.id || null);
      if (receiverId === loggedInUser?.id) {
        setReceiverId(null);
      }
    }
  }, [mode, loggedInUser]);

  // Filtered user lists
  const availableSenders = useMemo(() => {
    if (mode === "RECEIVED") {
      return users.filter((u) => u.id !== loggedInUser?.id);
    }
    if (mode === "OTHER" && receiverId) {
      return users.filter((u) => u.id !== receiverId);
    }
    return users;
  }, [users, mode, loggedInUser, receiverId]);

  const availableReceivers = useMemo(() => {
    if (mode === "PAID") {
      return users.filter((u) => u.id !== loggedInUser?.id);
    }
    if (mode === "OTHER" && senderId) {
      return users.filter((u) => u.id !== senderId);
    }
    return users;
  }, [users, mode, loggedInUser, senderId]);

  const onConfirmTime = useCallback(
    ({ hours, minutes }: DateTime) => {
      setTimeOpen(false);
      setTime({ hours, minutes });
    },
    [setTimeOpen, setTime],
  );

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

  const handleModeChange = (newMode: TransferMode) => {
    setMode(newMode);
    setError(null);
  };

  const handleSwap = () => {
    if (mode === "RECEIVED") {
      // Swapping when "I Received" means "I Paid" the other user
      const prevSender = senderId;
      setMode("PAID");
      setSenderId(loggedInUser?.id || null);
      setReceiverId(prevSender);
    } else if (mode === "PAID") {
      // Swapping when "I Paid" means "I Received" from the other user
      const prevReceiver = receiverId;
      setMode("RECEIVED");
      setReceiverId(loggedInUser?.id || null);
      setSenderId(prevReceiver);
    } else {
      // "OTHER" mode: swap sender and receiver directly
      const prevSender = senderId;
      setSenderId(receiverId);
      setReceiverId(prevSender);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!transferType) {
      setError("Transfer expense type not found. Please contact admin.");
      return;
    }

    if (!senderId) {
      setError("Please select a sender.");
      return;
    }

    if (!receiverId) {
      setError("Please select a receiver.");
      return;
    }

    if (senderId === receiverId) {
      setError("Sender and receiver cannot be the same person.");
      return;
    }

    try {
      setIsLoading(true);

      const expenseDate = new Date(inputDate);
      if (time.hours !== undefined && time.minutes !== undefined) {
        expenseDate.setHours(time.hours, time.minutes);
      }

      let newExpense: Expense = {
        date: expenseDate,
        type: { id: transferType.id, type: "expense" } as ExpenseType,
        amount: parsedAmount,
        description: description.trim() || undefined,
        sender: { id: senderId } as User,
        receiver: { id: receiverId } as User,
        tags: [],
        workType: selectedWorkType
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ({ id: selectedWorkType, type: "work" } as any)
          : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paymentPurpose: selectedPurpose as any,
      };

      newExpense = await ExpenseService.addExpense(newExpense);
      newExpense.date = new Date(newExpense.date);

      setExpenses((prevExpenses) => [
        newExpense,
        ...prevExpenses.filter((e) => e.id !== newExpense.id),
      ]);

      navigation.goBack();
    } catch (err: unknown) {
      const errorResponse = err as {
        response?: { data?: string };
        message?: string;
      };
      setError(
        errorResponse?.response?.data ||
          errorResponse?.message ||
          "An error occurred while saving the transfer.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSenderObj = users.find((u) => u.id === senderId);
  const selectedReceiverObj = users.find((u) => u.id === receiverId);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={commonAddScreenStyles.scrollViewContainer}
      >
        <LoadingError error={error} isLoading={isLoading} />

        {/* Direction Mode Selector Chips */}
        <View style={styles.modeChipsContainer}>
          <Chip
            testID="chip-received"
            selected={mode === "RECEIVED"}
            onPress={() => handleModeChange("RECEIVED")}
            icon="bank-transfer-in"
            style={[
              styles.modeChip,
              mode === "RECEIVED" && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            textStyle={
              mode === "RECEIVED"
                ? { color: theme.colors.onPrimaryContainer, fontWeight: "700" }
                : undefined
            }
          >
            I Received
          </Chip>
          <Chip
            testID="chip-paid"
            selected={mode === "PAID"}
            onPress={() => handleModeChange("PAID")}
            icon="bank-transfer-out"
            style={[
              styles.modeChip,
              mode === "PAID" && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            textStyle={
              mode === "PAID"
                ? { color: theme.colors.onPrimaryContainer, fontWeight: "700" }
                : undefined
            }
          >
            I Paid
          </Chip>
          <Chip
            testID="chip-other"
            selected={mode === "OTHER"}
            onPress={() => handleModeChange("OTHER")}
            icon="account-switch"
            style={[
              styles.modeChip,
              mode === "OTHER" && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            textStyle={
              mode === "OTHER"
                ? { color: theme.colors.onPrimaryContainer, fontWeight: "700" }
                : undefined
            }
          >
            Between Others
          </Chip>
        </View>

        {/* FROM (Sender) Section */}
        <View style={[styles.participantSection, { zIndex: 5000 }]}>
          <Text
            variant="labelMedium"
            style={[
              styles.sectionLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            FROM (Sender)
          </Text>

          {mode === "PAID" ? (
            <View
              testID="locked-sender-card"
              style={[
                styles.lockedUserCard,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.outlineVariant,
                },
              ]}
            >
              <Avatar.Text
                size={36}
                label={
                  loggedInUser?.name
                    ? loggedInUser.name.charAt(0).toUpperCase()
                    : "U"
                }
                style={{
                  backgroundColor: theme.colors.primaryContainer,
                  marginRight: 10,
                }}
                color={theme.colors.onPrimaryContainer}
              />
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                  {loggedInUser?.name || "You"}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Logged-in User
                </Text>
              </View>
              <Chip
                compact
                style={{ backgroundColor: theme.colors.primaryContainer }}
              >
                You
              </Chip>
            </View>
          ) : (
            <CustomDropDown
              testID="sender-picker"
              schema={{ label: "name", value: "id" }}
              zIndex={5000}
              zIndexInverse={1000}
              items={availableSenders}
              searchable={true}
              open={senderOpen}
              setOpen={setSenderOpen}
              containerStyle={{ height: 40, marginBottom: 8 }}
              value={senderId}
              setValue={setSenderId}
              itemSeparator={true}
              placeholder="Select Sender"
              renderListItem={({ item }) => (
                <UserDropDownItem
                  item={item}
                  setSelectedUser={setSenderId}
                  selectedUser={senderId}
                  setUserOpen={setSenderOpen}
                />
              )}
            />
          )}
        </View>

        {/* Swap Button */}
        <View style={styles.swapButtonRow}>
          <View
            style={[
              styles.swapDivider,
              { backgroundColor: theme.colors.outlineVariant },
            ]}
          />
          <TouchableOpacity
            testID="swap-direction-button"
            style={[
              styles.swapButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleSwap}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="swap-vertical"
              size={22}
              color={theme.colors.onPrimary}
            />
          </TouchableOpacity>
          <View
            style={[
              styles.swapDivider,
              { backgroundColor: theme.colors.outlineVariant },
            ]}
          />
        </View>

        {/* TO (Receiver) Section */}
        <View style={[styles.participantSection, { zIndex: 4000 }]}>
          <Text
            variant="labelMedium"
            style={[
              styles.sectionLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            TO (Receiver)
          </Text>

          {mode === "RECEIVED" ? (
            <View
              testID="locked-receiver-card"
              style={[
                styles.lockedUserCard,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.outlineVariant,
                },
              ]}
            >
              <Avatar.Text
                size={36}
                label={
                  loggedInUser?.name
                    ? loggedInUser.name.charAt(0).toUpperCase()
                    : "U"
                }
                style={{
                  backgroundColor: theme.colors.primaryContainer,
                  marginRight: 10,
                }}
                color={theme.colors.onPrimaryContainer}
              />
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                  {loggedInUser?.name || "You"}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Logged-in User
                </Text>
              </View>
              <Chip
                compact
                style={{ backgroundColor: theme.colors.primaryContainer }}
              >
                You
              </Chip>
            </View>
          ) : (
            <CustomDropDown
              testID="receiver-picker"
              schema={{ label: "name", value: "id" }}
              zIndex={4000}
              zIndexInverse={2000}
              items={availableReceivers}
              searchable={true}
              open={receiverOpen}
              setOpen={setReceiverOpen}
              containerStyle={{ height: 40, marginBottom: 8 }}
              value={receiverId}
              setValue={setReceiverId}
              itemSeparator={true}
              placeholder="Select Receiver"
              renderListItem={({ item }) => (
                <UserDropDownItem
                  item={item}
                  setSelectedUser={setReceiverId}
                  selectedUser={receiverId}
                  setUserOpen={setReceiverOpen}
                />
              )}
            />
          )}
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <TextInput
            testID="amount-input"
            keyboardType="numeric"
            label="Amount (₹)"
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            left={<TextInput.Affix text="₹" />}
            style={commonAddScreenStyles.inputField}
          />
        </View>

        {/* Optional Details Accordion Toggle */}
        <TouchableOpacity
          testID="toggle-details-button"
          style={styles.detailsToggle}
          onPress={() => setShowDetails((prev) => !prev)}
        >
          <MaterialCommunityIcons
            name={showDetails ? "chevron-down" : "chevron-right"}
            size={20}
            color={theme.colors.primary}
          />
          <Text
            variant="labelLarge"
            style={{
              color: theme.colors.primary,
              fontWeight: "600",
              marginLeft: 4,
            }}
          >
            {showDetails
              ? "Hide Optional Details"
              : "Add Details (Work, Notes, Date)"}
          </Text>
        </TouchableOpacity>

        {/* Collapsible Details */}
        {showDetails && (
          <View style={{ marginTop: 8, zIndex: 3000 }}>
            {/* Work Type & Purpose */}
            <CustomDropDown
              testID="transfer-work-type-picker"
              schema={{ label: "name", value: "id" }}
              zIndex={3000}
              zIndexInverse={3000}
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
                testID="transfer-purpose-picker"
                schema={{ label: "label", value: "value" }}
                zIndex={2000}
                zIndexInverse={4000}
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

            {/* Note / Description */}
            <TextInput
              testID="description-input"
              label="Note / Additional information (optional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              style={commonAddScreenStyles.inputField}
            />

            {/* Date picker */}
            <DatePickerInput
              locale="en"
              label="Transfer Date"
              value={inputDate}
              onChange={(d) => setInputDate(d || new Date())}
              inputMode="start"
              style={commonAddScreenStyles.inputField}
            />

            {/* Time picker */}
            <View
              style={[
                commonStyles.row,
                commonAddScreenStyles.marginVerticalEight,
              ]}
            >
              <View style={commonAddScreenStyles.section}>
                <Text style={commonAddScreenStyles.bold}>Time</Text>
                <Text>
                  {time &&
                  time.hours !== undefined &&
                  time.minutes !== undefined
                    ? timeFormatter.format(
                        new Date().setHours(time.hours, time.minutes),
                      )
                    : `Current Time: ${timeFormatter.format(new Date())}`}
                </Text>
              </View>
              <Button
                icon="clock"
                onPress={() => setTimeOpen(true)}
                mode="contained-tonal"
                title="Pick time"
              />
            </View>

            <TimePickerModal
              locale="en"
              visible={timeOpen}
              onDismiss={onDismissTime}
              onConfirm={onConfirmTime}
              hours={time.hours}
              minutes={time.minutes}
            />
          </View>
        )}

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            testID="submit-transfer-button"
            icon="bank-transfer"
            mode="contained"
            onPress={handleSubmit}
            disabled={isLoading || !amount}
            title={
              isLoading
                ? "Recording..."
                : mode === "RECEIVED"
                  ? `Record Receipt from ${selectedSenderObj?.name || "Sender"}`
                  : mode === "PAID"
                    ? `Record Transfer to ${selectedReceiverObj?.name || "Receiver"}`
                    : "Record Transfer"
            }
          />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  modeChipsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  modeChip: {
    flex: 1,
  },
  participantSection: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  lockedUserCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 56,
  },
  swapButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  swapDivider: {
    flex: 1,
    height: 1,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  amountContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 4,
  },
  submitContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});

export default AddTransferScreen;
