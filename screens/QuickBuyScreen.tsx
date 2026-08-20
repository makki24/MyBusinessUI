import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  Text,
  Card,
  useTheme,
  Divider,
  Switch,
  SegmentedButtons,
} from "react-native-paper";
import { useRecoilValue } from "recoil";
import {
  usersState,
  userState,
  expenseTypesState,
  workTypesState,
} from "../recoil/atom";
import WorkService from "../services/WorkService";
import ExpenseService from "../services/ExpenseService";
import BalanceService, { WorkTypeBalance } from "../services/BalanceService";
import CustomDropDown from "../components/common/CustomDropdown";
import UserDropDownItem from "../components/common/UserDropDownItem";
import NumberInput from "../components/common/NumberInput";
import Button from "../components/common/Button";
import LoadingError from "../components/common/LoadingError";
import Loading from "../src/components/common/Loading";
import { Expense, ExpenseType, User, Work, WorkType } from "../types";
import commonAddScreenStyles from "../src/styles/commonAddScreenStyles";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

interface QuickBuyScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const QuickBuyScreen: React.FC<QuickBuyScreenProps> = ({
  navigation: _navigation,
}) => {
  const theme = useTheme();
  const users = useRecoilValue(usersState);
  const loggedInUser = useRecoilValue(userState);
  const expenseTypes = useRecoilValue(expenseTypesState);

  // State
  const [sellerOpen, setSellerOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [payNow, setPayNow] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payPurpose, setPayPurpose] = useState("SETTLEMENT");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Balance state
  const [keniBalance, setKeniBalance] = useState<WorkTypeBalance | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Work types
  const workTypes = useRecoilValue(workTypesState);
  const keniWorkType = useMemo(
    () => workTypes.find((wt: WorkType) => wt.name === "Keni"),
    [workTypes],
  );

  const transferType = expenseTypes.find((t: ExpenseType) =>
    t.name?.toLowerCase().includes("transfer"),
  );

  // Filter users who have Keni work type pricing (arecanut sellers)
  const sellers = useMemo(() => {
    return users.filter((u: User) => {
      const hasKeniPrice = u.userProperties?.workTypePrices?.some(
        (wtp) => wtp.type?.name === "Keni",
      );
      return hasKeniPrice;
    });
  }, [users]);

  // Load balance when seller selected
  useEffect(() => {
    if (selectedSellerId) {
      setLoadingBalance(true);
      BalanceService.getUserBalance(selectedSellerId)
        .then((balance) => {
          const keni = balance.workTypeBalances.find(
            (wtb) => wtb.workTypeName === "Keni",
          );
          setKeniBalance(keni || null);

          // Auto-fill rate from user's Keni pricing
          const seller = users.find((u: User) => u.id === selectedSellerId);
          const keniPrice = seller?.userProperties?.workTypePrices?.find(
            (wtp) => wtp.type?.name === "Keni",
          );
          if (keniPrice) {
            setRate(keniPrice.pricePerUnit?.toString() || "");
          }
        })
        // eslint-disable-next-line no-console
        .catch(console.error)
        .finally(() => setLoadingBalance(false));
    }
  }, [selectedSellerId, users]);

  // Calculate total
  const total = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const r = parseFloat(rate) || 0;
    return Math.round(q * r * 100) / 100;
  }, [quantity, rate]);

  // Calculate new balance after purchase
  const newBalance = useMemo(() => {
    if (!keniBalance) return total;
    return keniBalance.netBalance + total;
  }, [keniBalance, total]);

  // Auto-fill pay amount when toggling "pay now"
  useEffect(() => {
    if (payNow && total > 0) {
      setPayAmount(Math.round(total).toString());
    }
  }, [payNow, total]);

  const formatCurrency = (amount: number) =>
    `₹${Math.abs(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const handleSubmit = async () => {
    setError(null);
    if (!selectedSellerId) {
      setError("Please select a seller");
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }
    if (!rate || parseFloat(rate) <= 0) {
      setError("Please enter a valid rate");
      return;
    }
    if (!keniWorkType) {
      setError("Keni work type not found. Please add it first.");
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Step 1: Create the Work entry (Keni)
      const work: Work = {
        date: new Date(),
        user: { id: selectedSellerId } as User,
        type: { id: keniWorkType.id, type: "work" } as WorkType,
        quantity: parseFloat(quantity),
        pricePerUnit: parseFloat(rate),
        amount: total,
        tags: [], // Will get default tags from work type
      };

      await WorkService.addWork(work);

      // Step 2: Create payment if requested
      if (payNow && payAmount && parseFloat(payAmount) > 0 && transferType) {
        const expense: Expense = {
          date: new Date(),
          type: { id: transferType.id, type: "expense" } as ExpenseType,
          amount: parseFloat(payAmount),
          sender: loggedInUser,
          receiver: { id: selectedSellerId } as User,
          tags: [],
          workType: { id: keniWorkType.id, type: "work" } as WorkType,
          paymentPurpose: payPurpose as "ADVANCE" | "ADHOC" | "SETTLEMENT",
          description: `Quick buy: ${quantity} K.G @ ₹${rate}`,
        };

        await ExpenseService.addExpense(expense);
      }

      setSuccess(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setQuantity("");
        setRate("");
        setPayNow(false);
        setPayAmount("");
        setSuccess(false);
        // Refresh balance
        if (selectedSellerId) {
          BalanceService.getUserBalance(selectedSellerId).then((balance) => {
            const keni = balance.workTypeBalances.find(
              (wtb) => wtb.workTypeName === "Keni",
            );
            setKeniBalance(keni || null);
          });
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data ?? err.message ?? "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={commonAddScreenStyles.scrollViewContainer}
      >
        <LoadingError error={error} isLoading={isLoading} />

        {success && (
          <Card
            style={{
              backgroundColor: theme.colors.primaryContainer,
              marginBottom: 16,
            }}
          >
            <Card.Content>
              <Text variant="titleMedium" style={{ textAlign: "center" }}>
                ✅ Purchase recorded!
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Seller Selector */}
        <CustomDropDown
          testID="seller-picker"
          schema={{ label: "name", value: "id" }}
          zIndex={3000}
          zIndexInverse={3000}
          items={sellers.length > 0 ? sellers : users}
          searchable={true}
          open={sellerOpen}
          setOpen={setSellerOpen}
          containerStyle={{ height: 40, marginBottom: 16 }}
          value={selectedSellerId}
          setValue={setSelectedSellerId}
          itemSeparator={true}
          placeholder="Select Arecanut Seller"
          renderListItem={({ item }) => (
            <UserDropDownItem
              item={item}
              setSelectedUser={setSelectedSellerId}
              selectedUser={selectedSellerId}
              setUserOpen={setSellerOpen}
            />
          )}
        />

        {/* Current Balance Card */}
        {loadingBalance && <Loading />}
        {selectedSellerId && keniBalance && !loadingBalance && (
          <Card style={{ marginBottom: 16 }} mode="outlined">
            <Card.Title title="Current Keni Balance" />
            <Card.Content>
              <View style={styles.balanceRow}>
                <Text>📦 Work Done:</Text>
                <Text>
                  {keniBalance.totalWorkQty.toLocaleString()} {keniBalance.unit}{" "}
                  = {formatCurrency(keniBalance.totalWorkAmount)}
                </Text>
              </View>
              <View style={styles.balanceRow}>
                <Text>💰 Advance:</Text>
                <Text>{formatCurrency(keniBalance.advancePaid)}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text>💸 Ad-hoc:</Text>
                <Text>{formatCurrency(keniBalance.adhocPaid)}</Text>
              </View>
              <Divider style={{ marginVertical: 8 }} />
              <View style={styles.balanceRow}>
                <Text variant="titleSmall" style={{ fontWeight: "bold" }}>
                  Net:
                </Text>
                <Text
                  variant="titleSmall"
                  style={{
                    fontWeight: "bold",
                    color:
                      keniBalance.netBalance > 0
                        ? theme.colors.error
                        : theme.colors.primary,
                  }}
                >
                  {formatCurrency(keniBalance.netBalance)}
                  {keniBalance.netBalance > 0
                    ? " (owed)"
                    : keniBalance.netBalance < 0
                      ? " (advance)"
                      : " ✅"}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {selectedSellerId && !keniBalance && !loadingBalance && (
          <Card
            style={{
              marginBottom: 16,
              backgroundColor: theme.colors.surfaceVariant,
            }}
            mode="contained"
          >
            <Card.Content>
              <Text>
                No Keni history found for this seller. This will be their first
                entry.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Purchase Details */}
        <NumberInput
          label="Quantity (K.G)"
          value={quantity}
          onChangeText={setQuantity}
        />
        <NumberInput
          label="Rate (₹ per K.G)"
          value={rate}
          onChangeText={setRate}
        />

        {total > 0 && (
          <Card
            style={{
              marginBottom: 16,
              backgroundColor: theme.colors.secondaryContainer,
            }}
            mode="contained"
          >
            <Card.Content>
              <Text variant="titleMedium" style={{ textAlign: "center" }}>
                Total: {formatCurrency(total)}
              </Text>
              {keniBalance && (
                <Text
                  variant="bodySmall"
                  style={{ textAlign: "center", marginTop: 4 }}
                >
                  New balance: {formatCurrency(newBalance)}{" "}
                  {newBalance > 0 ? "(owed)" : "(advance)"}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Payment Option */}
        <View style={styles.switchRow}>
          <Text variant="bodyLarge">Pay now?</Text>
          <Switch value={payNow} onValueChange={setPayNow} />
        </View>

        {payNow && (
          <>
            <NumberInput
              label="Payment Amount"
              value={payAmount}
              onChangeText={setPayAmount}
            />
            <SegmentedButtons
              value={payPurpose}
              onValueChange={setPayPurpose}
              buttons={[
                { value: "ADVANCE", label: "Advance" },
                { value: "ADHOC", label: "Ad-hoc" },
                { value: "SETTLEMENT", label: "Settlement" },
              ]}
              style={{ marginBottom: 16 }}
            />
          </>
        )}

        {/* Submit */}
        <Button
          icon="check"
          mode="contained"
          onPress={handleSubmit}
          disabled={isLoading || !selectedSellerId || !quantity || !rate}
          title={payNow ? "Record + Pay" : "Record Purchase"}
        />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
});

export default QuickBuyScreen;
