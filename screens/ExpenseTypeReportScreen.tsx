import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRecoilState, useRecoilValue } from "recoil";
import ReportItem from "../components/ReportItem";
import {
  userState,
  usersState,
  expenseTypesState,
  tagsState,
} from "../recoil/atom";
import ReportService from "../services/ReportService";
import ExpenseService from "../services/ExpenseService";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { IconButton, Text, TextInput, useTheme } from "react-native-paper";
import Loading from "../src/components/common/Loading";
import { UI_ELEMENTS_GAP, BORDER_RADIUS } from "../src/styles/constants";
import { REPORT_BACKGROUND_COLOR } from "../src/styles/colors";
import { Expense, ExpenseType, User, UserReport, Tag } from "../types";
import SwitchInput from "../components/common/SwitchInput";
import CustomDropDown from "../components/common/CustomDropdown";
import UserDropDownItem from "../components/common/UserDropDownItem";
import { ADD_EXPENSE_DIFFERENT_SENDER_LABEL } from "../src/constants/labels";

interface ExpenseTypeReportScreenProps {
  navigation: NavigationProp<ParamListBase>;
  route: {
    params: {
      expenseTypeId: number;
      expenseTypeName: string;
    };
  };
}

const ExpenseTypeReportScreen: React.FC<ExpenseTypeReportScreenProps> = ({
  navigation,
  route,
}) => {
  const expenseTypeId = route.params?.expenseTypeId;
  const expenseTypeName = route.params?.expenseTypeName || "Expense Details";

  useEffect(() => {
    navigation.setOptions({ title: expenseTypeName });
  }, [expenseTypeName, navigation]);

  if (!expenseTypeId) {
    return (
      <View
        style={{
          ...commonStyles.container,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>No Expense Type ID provided</Text>
      </View>
    );
  }

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [differentSender, setDifferentSender] = useState<boolean>(false);
  const [senderOpen, setSenderOpen] = useState(false);
  const [sender, setSender] = useState<string | null>(null);

  const [totalThisMonth, setTotalThisMonth] = useState<number>(0);

  const loggedInUser = useRecoilValue(userState);
  const users = useRecoilValue(usersState);
  const expenseTypes = useRecoilValue(expenseTypesState);
  const tags = useRecoilValue(tagsState);

  const expenseType = expenseTypes.find(
    (t: ExpenseType) => t.id === expenseTypeId,
  );

  const isTransfer =
    expenseType?.isReceivingUser ||
    expenseType?.name?.toLowerCase().includes("transfer");

  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tagOpen, setTagOpen] = useState(false);

  useEffect(() => {
    if (expenseType?.defaultTags) {
      setSelectedTags(expenseType.defaultTags.map((t) => t.id));
    }
  }, [expenseType]);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setShowMessage(false);
    setDifferentSender(false);
    setSender(null);
    if (expenseType?.defaultTags) {
      setSelectedTags(expenseType.defaultTags.map((t) => t.id));
    } else {
      setSelectedTags([]);
    }
  };

  const onReset = () => {
    setOffset(0);
    setHasMore(true);
    setReports([]);
  };

  const fetchReports = async (reset = false) => {
    setError("");
    try {
      if (isRefreshing) return;

      if (reset) {
        onReset();
      }

      if (!hasMore && !reset) return;

      setIsRefreshing(true);

      const reportsData = await ReportService.getReportByExpenseType(
        expenseTypeId,
        reset ? 0 : offset,
        limit,
      );

      if (reportsData.length < limit) {
        setHasMore(false);
      }

      const formattedData = reportsData.map((report) => ({
        ...report,
        date: new Date(report.date),
      }));

      if (reset) {
        setReports(formattedData);
      } else {
        setReports((prevReports) => [...prevReports, ...formattedData]);
      }

      setOffset((prevOffset) => prevOffset + limit);
    } catch (fetchError) {
      setError(
        fetchError.message || "Error fetching reports. Please try again.",
      );
      setHasMore(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchTotalThisMonth = async () => {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const endOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );
      const res = await ReportService.getExpenseSummaryByType({
        fromDate: firstDay,
        toDate: endOfToday,
        type: [expenseType],
        user: [],
        sender: [],
        receiver: [],
        tags: [],
      });
      // The API returns a list, find the one matching our type
      const summary = res.find(
        (s) => s.baseTransactionType.id === expenseTypeId,
      );
      if (summary) {
        setTotalThisMonth(summary.totalAmount);
      } else {
        setTotalThisMonth(0);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch total this month", err);
    }
  };

  useEffect(() => {
    fetchReports(true);
    fetchTotalThisMonth();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleRefresh = () => {
    fetchReports(true);
    fetchTotalThisMonth();
  };

  const handleLoadMore = () => {
    if (error) return;
    fetchReports();
  };

  const handleSend = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!expenseType) {
      setError("Expense type not found.");
      return;
    }

    if (differentSender && !sender) {
      setError("Please select a sender");
      return;
    }

    if (
      expenseType?.name?.toLowerCase() === "accessories" &&
      !description.trim()
    ) {
      setError("Additional details are mandatory for Accessories.");
      return;
    }

    setError(null);
    setIsSending(true);
    Keyboard.dismiss();

    try {
      const expense: Expense = {
        date: new Date(Date.now() - 1000),
        type: { id: expenseType.id, type: "expense" } as ExpenseType,
        amount: parseFloat(amount),
        description: description || undefined,
        sender:
          differentSender && sender ? ({ id: sender } as User) : loggedInUser,
        receiver: undefined, // Direct expense, no receiver
        tags: !isTransfer
          ? (selectedTags.map((tagId) => ({ id: tagId })) as Tag[])
          : expenseType.defaultTags
            ? [...expenseType.defaultTags]
            : [],
      };

      await ExpenseService.addExpense(expense);

      // Clear fields and refresh
      resetForm();
      fetchReports(true);
      fetchTotalThisMonth();
    } catch (err) {
      setError(
        err.response?.data ??
          err.message ??
          "An error occurred while saving the expense",
      );
    } finally {
      setIsSending(false);
    }
  };

  const Wrapper = Platform.OS === "ios" ? KeyboardAvoidingView : View;
  const wrapperProps =
    Platform.OS === "ios"
      ? { behavior: "padding" as const, keyboardVerticalOffset: 100 }
      : {};

  return (
    <Wrapper style={{ flex: 1 }} {...wrapperProps}>
      <View
        style={{
          ...commonStyles.container,
          backgroundColor: REPORT_BACKGROUND_COLOR,
          flex: 1,
        }}
      >
        <FlatList
          ListHeaderComponent={() => <View />}
          inverted={true}
          ListFooterComponent={() => {
            return (
              <View style={{ alignItems: "center" }}>
                {!hasMore && <Text>You have reached the end of list </Text>}
                {hasMore && <Loading />}
                <LoadingError error={error} isLoading={false} />
              </View>
            );
          }}
          data={reports}
          renderItem={({ item, index }) => (
            <ReportItem
              reportData={item}
              hideBalance={true}
              bottomText="Month Total"
              bottomValue={totalThisMonth}
              hideBottomSection={index !== 0}
              bottomValueColor={theme.colors.error}
              alwaysShowSender={true}
            />
          )}
          keyExtractor={(item, index) => `${index}`}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      </View>

      {/* Payment Bar */}
      <View
        style={[
          styles.paymentBar,
          {
            backgroundColor: theme.colors.surface,
            paddingBottom: Math.max(insets.bottom, UI_ELEMENTS_GAP),
          },
        ]}
      >
        <LoadingError error={error} isLoading={isSending} />

        {/* Sender Options (Toggled) */}
        {differentSender && (
          <View style={{ marginBottom: 8 }}>
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
              containerStyle={{ height: 40 }}
              value={sender}
              setValue={setSender}
              itemSeparator={true}
              placeholder="Select Sender"
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

        {/* Message & Options input (toggled) */}
        {showMessage && (
          <View style={{ marginBottom: 8, zIndex: 3000 }}>
            <SwitchInput
              label={ADD_EXPENSE_DIFFERENT_SENDER_LABEL}
              value={differentSender}
              onValueChange={setDifferentSender}
            />
            {!isTransfer && (
              <View style={{ marginTop: 8, zIndex: 3000 }}>
                <CustomDropDown
                  testID="tags-picker"
                  multiple={true}
                  items={tags}
                  zIndex={3000}
                  zIndexInverse={2000}
                  schema={{
                    label: "name",
                    value: "id",
                  }}
                  open={tagOpen}
                  setOpen={setTagOpen}
                  containerStyle={{ height: 40, marginBottom: 8 }}
                  value={selectedTags}
                  setValue={setSelectedTags}
                  itemSeparator={true}
                  placeholder="Select Tags"
                />
              </View>
            )}
            <TextInput
              placeholder="Add a message..."
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              dense
              style={styles.messageInput}
              right={
                <TextInput.Icon
                  icon="close"
                  onPress={() => {
                    resetForm();
                  }}
                />
              }
            />
          </View>
        )}

        {/* Amount row */}
        <View style={styles.amountRow}>
          <IconButton
            testID="message-toggle-button"
            icon={showMessage ? "message-text" : "message-text-outline"}
            mode="contained-tonal"
            size={22}
            onPress={() => setShowMessage(!showMessage)}
            style={[
              styles.messageToggle,
              {
                backgroundColor: showMessage
                  ? theme.colors.primaryContainer
                  : theme.colors.surfaceVariant,
              },
            ]}
          />

          <View style={styles.amountInputWrapper}>
            <Text
              variant="headlineMedium"
              style={[styles.currencySymbol, { color: theme.colors.primary }]}
            >
              ₹
            </Text>
            <TextInput
              keyboardType="numeric"
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              mode="flat"
              style={[styles.amountInput, { backgroundColor: "transparent" }]}
              contentStyle={styles.amountInputContent}
              underlineStyle={{ display: "none" }}
              placeholderTextColor={theme.colors.outlineVariant}
            />
          </View>

          <IconButton
            testID="send-icon-button"
            icon="send"
            mode="contained"
            size={26}
            disabled={!amount || isSending}
            onPress={handleSend}
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  amount && !isSending
                    ? theme.colors.primary
                    : theme.colors.surfaceDisabled,
              },
            ]}
            iconColor={
              amount && !isSending
                ? theme.colors.onPrimary
                : theme.colors.onSurfaceDisabled
            }
          />

          <IconButton
            icon="refresh"
            mode="contained-tonal"
            size={22}
            onPress={handleRefresh}
            style={[
              styles.refreshButton,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          />
        </View>
      </View>
      {Platform.OS === "android" && keyboardHeight > 0 && (
        <View style={{ height: keyboardHeight + 20 }} />
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  paymentBar: {
    paddingHorizontal: UI_ELEMENTS_GAP,
    paddingVertical: UI_ELEMENTS_GAP,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messageInput: {
    marginTop: 8,
    fontSize: 14,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  messageToggle: {
    margin: 0,
    borderRadius: BORDER_RADIUS,
  },
  amountInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 12,
    height: 52,
  },
  currencySymbol: {
    fontWeight: "700",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    paddingHorizontal: 0,
    height: 52,
  },
  amountInputContent: {
    fontSize: 24,
    fontWeight: "600",
    paddingHorizontal: 0,
  },
  sendButton: {
    margin: 0,
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  refreshButton: {
    margin: 0,
    borderRadius: BORDER_RADIUS,
  },
});

export default ExpenseTypeReportScreen;
