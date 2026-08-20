import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  FlatList,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  useTheme,
  Divider,
  TextInput,
  SegmentedButtons,
  Chip,
  Avatar,
} from "react-native-paper";
import ProfilePicture from "../src/components/common/ProfilePicture";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  usersState,
  userState,
  expenseTypesState,
  workTypesState,
} from "../recoil/atom";
import BalanceService, {
  UserBalance,
  WorkTypeBalance,
} from "../services/BalanceService";
import ExpenseService from "../services/ExpenseService";
import UserService from "../services/UserService";
import CustomDropDown from "../components/common/CustomDropdown";
import UserDropDownItem from "../components/common/UserDropDownItem";
import Button from "../components/common/Button";
import LoadingError from "../components/common/LoadingError";
import Loading from "../src/components/common/Loading";
import { Expense, ExpenseType, User } from "../types";
import commonStyles from "../src/styles/commonStyles";
import { UI_ELEMENTS_GAP } from "../src/styles/constants";
import SmartBulkSettleModal from "../components/expense/SmartBulkSettleModal";

const SettlementScreen = () => {
  const theme = useTheme();
  const [users, setUsers] = useRecoilState(usersState);
  const loggedInUser = useRecoilValue(userState);
  const expenseTypes = useRecoilValue(expenseTypesState);
  const workTypes = useRecoilValue(workTypesState);

  const [userOpen, setUserOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  // Payment state per work type
  const [paymentAmounts, setPaymentAmounts] = useState<Record<number, string>>(
    {},
  );
  const [paymentPurposes, setPaymentPurposes] = useState<
    Record<number, string>
  >({});
  const [payingWorkTypeId, setPayingWorkTypeId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const selectedUser = users.find((u: User) => u.id === selectedUserId);

  const transferType = expenseTypes.find((t: ExpenseType) =>
    t.name?.toLowerCase().includes("transfer"),
  );

  const fetchBalance = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await BalanceService.getUserBalance(userId);
      setBalance(data);
    } catch (err: Error | unknown) {
      setError((err as Error).message || "Error fetching balance");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchBalance(selectedUserId);
    }
  }, [selectedUserId, fetchBalance]);

  const handlePay = async (workTypeBalance: WorkTypeBalance) => {
    const amount = paymentAmounts[workTypeBalance.workTypeId];
    const purpose = paymentPurposes[workTypeBalance.workTypeId] || "SETTLEMENT";

    if (!amount || parseFloat(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setPayingWorkTypeId(workTypeBalance.workTypeId);
    setError(null);

    try {
      const expense: Expense = {
        date: new Date(),
        type: { id: transferType?.id, type: "expense" } as ExpenseType,
        amount: parseFloat(amount),
        sender: loggedInUser as User,
        receiver: { id: selectedUserId } as User,
        tags: [],
        workType: { id: workTypeBalance.workTypeId, type: "work" } as never,
        paymentPurpose: purpose as never,
        description: `${workTypeBalance.workTypeName} ${purpose.toLowerCase()}`,
      };

      await ExpenseService.addExpense(expense);

      // Clear and refresh
      setPaymentAmounts((prev) => ({
        ...prev,
        [workTypeBalance.workTypeId]: "",
      }));
      fetchBalance(selectedUserId!);
    } catch (err: Error | unknown) {
      setError((err as Error).message || "Payment failed");
    } finally {
      setPayingWorkTypeId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount < 0) {
      return `-₹${Math.abs(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    }
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const renderWorkTypeCard = (wtb: WorkTypeBalance) => {
    const isOwed = wtb.netBalance > 0;
    const isExcessAdvance = wtb.netBalance < 0;

    return (
      <Card key={wtb.workTypeId} style={styles.card} mode="outlined">
        <Card.Title
          title={wtb.workTypeName}
          right={() => (
            <Chip
              mode="flat"
              style={{
                backgroundColor: isOwed
                  ? theme.colors.errorContainer
                  : isExcessAdvance
                    ? theme.colors.tertiaryContainer
                    : theme.colors.primaryContainer,
                marginRight: 16,
              }}
            >
              {isOwed
                ? `${formatCurrency(wtb.netBalance)} owed`
                : isExcessAdvance
                  ? `${formatCurrency(wtb.netBalance)} advance`
                  : "Settled ✅"}
            </Chip>
          )}
        />
        <Card.Content>
          {/* Work Done */}
          <View style={styles.row}>
            <Text variant="bodyMedium">📦 Work Done:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {wtb.totalWorkQty.toLocaleString()} {wtb.unit} ={" "}
              {formatCurrency(wtb.totalWorkAmount)}
            </Text>
          </View>

          {wtb.advancePaid < 0 && (
            <View style={styles.row}>
              <Text variant="bodyMedium">💰 Old balance:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {formatCurrency(wtb.advancePaid)}
              </Text>
            </View>
          )}

          {wtb.otherTaggedPaid < 0 && (
            <View style={styles.row}>
              <Text variant="bodyMedium">💸 Expenses Paid by User:</Text>
              <Text
                variant="bodyMedium"
                style={[styles.value, { color: theme.colors.primary }]}
              >
                + {formatCurrency(Math.abs(wtb.otherTaggedPaid))}
              </Text>
            </View>
          )}

          <Divider style={styles.divider} />

          {wtb.advancePaid >= 0 && (
            <View style={styles.row}>
              <Text variant="bodyMedium">💰 Advance:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {formatCurrency(wtb.advancePaid)}
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Text variant="bodyMedium">💸 Ad-hoc:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {formatCurrency(wtb.adhocPaid)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text variant="bodyMedium">✅ Settlement:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {formatCurrency(wtb.settlementPaid)}
            </Text>
          </View>
          {wtb.untaggedPaid > 0 && (
            <View style={styles.row}>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.outline }}
              >
                📎 Untagged (old):
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.value, { color: theme.colors.outline }]}
              >
                {formatCurrency(wtb.untaggedPaid)}
              </Text>
            </View>
          )}
          {wtb.otherTaggedPaid > 0 && (
            <View style={styles.row}>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.outline }}
              >
                🔄 Sales Collected by User:
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.value, { color: theme.colors.outline }]}
              >
                {formatCurrency(wtb.otherTaggedPaid)}
              </Text>
            </View>
          )}

          <Divider style={styles.divider} />

          {/* Net */}
          <View style={styles.row}>
            <Text variant="titleSmall" style={{ fontWeight: "bold" }}>
              Net:
            </Text>
            <Text
              variant="titleSmall"
              style={[
                styles.value,
                {
                  fontWeight: "bold",
                  color: isOwed ? theme.colors.error : theme.colors.primary,
                },
              ]}
            >
              {formatCurrency(wtb.netBalance)}{" "}
              {isOwed ? "(owed)" : isExcessAdvance ? "(excess advance)" : ""}
            </Text>
          </View>

          {/* Payment Actions */}
          <View style={styles.paymentSection}>
            <SegmentedButtons
              value={paymentPurposes[wtb.workTypeId] || "SETTLEMENT"}
              onValueChange={(val) =>
                setPaymentPurposes((prev) => ({
                  ...prev,
                  [wtb.workTypeId]: val,
                }))
              }
              buttons={[
                { value: "ADVANCE", label: "Advance" },
                { value: "ADHOC", label: "Ad-hoc" },
                { value: "SETTLEMENT", label: "Settlement" },
              ]}
              density="small"
              style={styles.segmentedButtons}
            />

            <View style={styles.payRow}>
              <View style={styles.amountInputWrapper}>
                <Text
                  variant="titleMedium"
                  style={{ fontWeight: "700", marginRight: 4 }}
                >
                  ₹
                </Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="0"
                  value={paymentAmounts[wtb.workTypeId] || ""}
                  onChangeText={(val) =>
                    setPaymentAmounts((prev) => ({
                      ...prev,
                      [wtb.workTypeId]: val,
                    }))
                  }
                  mode="flat"
                  dense
                  style={{ flex: 1, backgroundColor: "transparent" }}
                />
              </View>
              <Button
                icon="send"
                mode="contained"
                title="Pay"
                onPress={() => handlePay(wtb)}
                disabled={payingWorkTypeId === wtb.workTypeId}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (!selectedUserId) {
    const filteredUsers = users.filter((u: User) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
      <View style={commonStyles.container}>
        <View style={{ padding: 16 }}>
          <TextInput
            placeholder="Search for a user..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            left={<TextInput.Icon icon="magnify" />}
            style={{ backgroundColor: "#fff" }}
            outlineStyle={{ borderRadius: 24 }}
            dense
          />
        </View>
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => `user-${item.id}`}
          numColumns={4}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width: "25%", alignItems: "center", marginBottom: 20 }}
              onPress={() => setSelectedUserId(item.id)}
            >
              {item.picture ? (
                <ProfilePicture
                  size={56}
                  picture={item.picture}
                  style={{ marginBottom: 4 }}
                />
              ) : (
                <Avatar.Text
                  size={56}
                  label={item.name ? item.name.charAt(0).toUpperCase() : "?"}
                  style={{
                    backgroundColor: theme.colors.surfaceVariant,
                    marginBottom: 4,
                  }}
                  color={theme.colors.onSurfaceVariant}
                />
              )}
              <Text
                style={{ fontSize: 12, textAlign: "center" }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={commonStyles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            if (selectedUserId) {
              setRefreshing(true);
              fetchBalance(selectedUserId);
            }
          }}
        />
      }
    >
      <View
        style={{
          zIndex: 1000,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <View style={{ flex: 1 }}>
          <CustomDropDown
            open={userOpen}
            setOpen={setUserOpen}
            value={selectedUserId}
            setValue={setSelectedUserId as never}
            items={users}
            schema={{ label: "name", value: "id" }}
            placeholder="Select User"
            searchable={true}
            renderListItem={(props: { item: User }) => (
              <UserDropDownItem
                selectedUser={selectedUserId as string}
                setSelectedUser={setSelectedUserId as never}
                setUserOpen={setUserOpen}
                item={props.item}
              />
            )}
          />
        </View>
        <Button
          icon="close"
          mode="text"
          onPress={() => {
            setSelectedUserId(null);
            setBalance(null);
          }}
          title=""
          style={{ minWidth: 0, marginTop: 2 }}
        />
      </View>

      <LoadingError error={error} isLoading={false} />

      {isLoading && <Loading />}

      {/* Balance Display */}
      {balance && !isLoading && (
        <View style={{ paddingBottom: 60 }}>
          {/* Overall Net */}
          <Card
            style={[
              styles.card,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
            mode="contained"
          >
            <Card.Content>
              <Text
                variant="titleLarge"
                style={{ textAlign: "center", fontWeight: "bold" }}
              >
                Overall Net: {formatCurrency(balance.netBalance)}
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  textAlign: "center",
                  color: theme.colors.onPrimaryContainer,
                }}
              >
                {balance.netBalance > 0
                  ? "Family owes this person"
                  : balance.netBalance < 0
                    ? "This person owes the family"
                    : "All settled"}
              </Text>
              {selectedUser?.lastSettlementDate && (
                <Text
                  variant="bodySmall"
                  style={{
                    textAlign: "center",
                    marginTop: 4,
                    color: theme.colors.onPrimaryContainer,
                    fontWeight: "500",
                  }}
                >
                  Last settled on:{" "}
                  {new Date(selectedUser.lastSettlementDate).toLocaleDateString(
                    "en-GB",
                  )}
                </Text>
              )}
            </Card.Content>
          </Card>

          {/* Per Work Type Cards */}
          {balance.workTypeBalances.map(renderWorkTypeCard)}

          {/* Untagged Payments / Activities */}
          {(balance.untaggedPayments > 0 ||
            balance.sales > 0 ||
            balance.contributionsReceived > 0) && (
            <Card style={styles.card} mode="outlined">
              <Card.Content>
                <Text
                  variant="titleMedium"
                  style={{ fontWeight: "bold", marginBottom: 8 }}
                >
                  📎 Untagged Payments & Activities (Old)
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.outline, marginBottom: 16 }}
                >
                  {formatCurrency(
                    balance.untaggedPayments +
                      balance.sales +
                      balance.contributionsReceived -
                      balance.expensesSent -
                      balance.contributionsSent,
                  )}{" "}
                  in transactions from before advance tracking was added. These
                  are included in the overall net but not categorized by work
                  type.
                </Text>
                <Button
                  mode="contained"
                  icon="auto-fix"
                  title="Smart Bulk Settle"
                  onPress={() => setModalVisible(true)}
                />
              </Card.Content>
            </Card>
          )}

          {/* Other Activities */}
          {(balance.expensesSent > 0 ||
            balance.sales > 0 ||
            balance.contributionsSent > 0 ||
            balance.contributionsReceived > 0) && (
            <Card style={styles.card} mode="outlined">
              <Card.Title
                title="Other Activities (دیگر)"
                subtitle="Transactions not related to work types"
              />
              <Card.Content>
                {balance.expensesSent > 0 && (
                  <View style={styles.row}>
                    <Text variant="bodyMedium">💸 Expenses Paid by User:</Text>
                    <Text
                      variant="bodyMedium"
                      style={[styles.value, { color: theme.colors.primary }]}
                    >
                      + {formatCurrency(balance.expensesSent)}
                    </Text>
                  </View>
                )}
                {balance.contributionsSent > 0 && (
                  <View style={styles.row}>
                    <Text variant="bodyMedium">🎁 Contributions Sent:</Text>
                    <Text
                      variant="bodyMedium"
                      style={[styles.value, { color: theme.colors.primary }]}
                    >
                      + {formatCurrency(balance.contributionsSent)}
                    </Text>
                  </View>
                )}
                {balance.sales > 0 && (
                  <View style={styles.row}>
                    <Text variant="bodyMedium">
                      🛒 Sales Collected by User:
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={[styles.value, { color: theme.colors.error }]}
                    >
                      - {formatCurrency(balance.sales)}
                    </Text>
                  </View>
                )}
                {balance.contributionsReceived > 0 && (
                  <View style={styles.row}>
                    <Text variant="bodyMedium">📥 Contributions Received:</Text>
                    <Text
                      variant="bodyMedium"
                      style={[styles.value, { color: theme.colors.error }]}
                    >
                      - {formatCurrency(balance.contributionsReceived)}
                    </Text>
                  </View>
                )}
                <Divider style={styles.divider} />
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.outline, marginTop: 4 }}
                >
                  These amounts are factored into the Overall Net shown at the
                  top.
                </Text>
              </Card.Content>
            </Card>
          )}

          <SmartBulkSettleModal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            userId={selectedUserId!}
            untaggedTotal={
              balance.untaggedPayments +
              balance.sales +
              balance.contributionsReceived -
              balance.expensesSent -
              balance.contributionsSent
            }
            workTypeBalances={balance.workTypeBalances}
            workTypes={workTypes}
            onSettlementComplete={async () => {
              if (selectedUserId) fetchBalance(selectedUserId);
              try {
                const updatedUsers = await UserService.getUsers();
                setUsers(updatedUsers);
              } catch (err) {
                console.log("Failed to update users after settlement:", err);
              }
            }}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: UI_ELEMENTS_GAP,
    marginHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  value: {
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    marginVertical: 8,
  },
  paymentSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  payRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amountInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  userListSection: {
    marginBottom: 16,
    paddingTop: 8,
  },
  userGridItem: {
    alignItems: "center",
    width: 76,
    padding: 8,
  },
  userGridText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
});

export default SettlementScreen;
