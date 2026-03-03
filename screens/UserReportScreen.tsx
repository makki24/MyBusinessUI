// src/screens/ReportScreen.tsx
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
import { useRecoilState, useRecoilValue } from "recoil";
import ReportItem from "../components/ReportItem";
import {
  userReportsState,
  userState,
  usersState,
  expenseTypesState,
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
import { Expense, ExpenseType, User } from "../types";

interface UserReportScreenProps {
  navigation: NavigationProp<ParamListBase>;
  route: {
    params: {
      userId: number;
    };
  };
}
const UserReportScreen: React.FC<UserReportScreenProps> = ({ route }) => {
  const userId = route.params?.userId;

  if (!userId) {
    return (
      <View
        style={{
          ...commonStyles.container,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>No user ID provided</Text>
      </View>
    );
  }

  const theme = useTheme();
  const [reports, setReports] = useRecoilState(userReportsState);
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

  const loggedInUser = useRecoilValue(userState);
  const users = useRecoilValue(usersState);
  const expenseTypes = useRecoilValue(expenseTypesState);

  // Find the receiver user from the users list
  const receiverUser = users.find(
    (u: User) => u.id?.toString() === userId.toString(),
  );

  // Check if viewing own report
  const isSameUser = loggedInUser?.id?.toString() === userId.toString();

  // Find the "transfer" expense type
  const transferType = expenseTypes.find(
    (t: ExpenseType) =>
      t.name?.toLowerCase().includes("transfer") ||
      t.name?.toLowerCase().includes("Transfer"),
  );

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

      const reportsData = await ReportService.getReportByUser(
        userId,
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

  useEffect(() => {
    fetchReports(true);
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

    if (!transferType) {
      setError("Transfer type not found. Please check expense types.");
      return;
    }

    setError(null);
    setIsSending(true);
    Keyboard.dismiss();

    try {
      const expense: Expense = {
        date: new Date(),
        type: { id: transferType.id, type: "expense" } as ExpenseType,
        amount: parseFloat(amount),
        description: description || undefined,
        sender: loggedInUser,
        receiver: receiverUser ? ({ id: receiverUser.id } as User) : undefined,
        tags: [],
      };

      await ExpenseService.addExpense(expense);

      // Clear fields and refresh
      setAmount("");
      setDescription("");
      setShowMessage(false);
      fetchReports(true);
    } catch (err) {
      setError(
        err.response?.data ??
          err.message ??
          "An error occurred while sending the transfer",
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
          renderItem={({ item }) => <ReportItem reportData={item} />}
          keyExtractor={(item, index) => `${index}`}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      </View>

      {/* PhonePe-style Payment Bar — hidden for own report */}
      {!isSameUser && (
        <View
          style={[styles.paymentBar, { backgroundColor: theme.colors.surface }]}
        >
          <LoadingError error={error} isLoading={isSending} />

          {/* Receiver info */}
          {receiverUser && (
            <View style={styles.receiverRow}>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Sending to
              </Text>
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onSurface, marginLeft: 4 }}
              >
                {receiverUser.name}
              </Text>
            </View>
          )}

          {/* Message input (toggled) */}
          {showMessage && (
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
                    setShowMessage(false);
                    setDescription("");
                  }}
                />
              }
            />
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
      )}
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
  receiverRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  messageInput: {
    marginBottom: 8,
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

export default UserReportScreen;
