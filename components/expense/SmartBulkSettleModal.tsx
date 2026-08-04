import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Modal,
  Portal,
  Text,
  Button,
  useTheme,
  Card,
  RadioButton,
  Menu,
} from "react-native-paper";
import { DatePickerInput } from "react-native-paper-dates";
import ExpenseService from "../../services/ExpenseService";
import { WorkTypeBalance } from "../../services/BalanceService";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ExpenseType, User, WorkType } from "../../types";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  userId: string;
  untaggedTotal: number;
  workTypeBalances: WorkTypeBalance[];
  workTypes: WorkType[];
  onSettlementComplete: () => void;
};

const SmartBulkSettleModal: React.FC<Props> = ({
  visible,
  onDismiss,
  userId,
  untaggedTotal,
  workTypeBalances,
  workTypes,
  onSettlementComplete,
}) => {
  const theme = useTheme();
  const [isSettling, setIsSettling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculated allocations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allocations, setAllocations] = useState<any[]>([]);
  const [remainder, setRemainder] = useState<number>(0);

  // Remainder actions
  const [remainderAction, setRemainderAction] = useState<
    "LEAVE_UNTAGGED" | "ADVANCE_TO_WORK_TYPE"
  >("LEAVE_UNTAGGED");
  const [remainderWorkTypeId, setRemainderWorkTypeId] = useState<number | null>(
    null,
  );
  const [workTypeMenuVisible, setWorkTypeMenuVisible] = useState(false);

  // Date
  const [settlementDate, setSettlementDate] = useState<Date | undefined>(
    new Date(),
  );

  useEffect(() => {
    if (visible) {
      calculateAllocations();
      setRemainderAction("LEAVE_UNTAGGED");
      setRemainderWorkTypeId(null);
      setSettlementDate(new Date());
      setError(null);
    }
  }, [visible, untaggedTotal, workTypeBalances]);

  const calculateAllocations = () => {
    let pool = Math.round(untaggedTotal);
    const newAllocations = [];

    for (const wtb of workTypeBalances) {
      if (wtb.netBalance > 0 && pool > 0) {
        // We owe them money, and we have untagged funds
        const amountToSettle = Math.min(wtb.netBalance, pool);
        newAllocations.push({
          workTypeId: wtb.workTypeId,
          workTypeName: wtb.workTypeName,
          amount: amountToSettle,
          purpose: "SETTLEMENT",
        });
        pool -= amountToSettle;
      }
    }

    setAllocations(newAllocations);
    setRemainder(pool);
  };

  const handleConfirm = async () => {
    if (remainderAction === "ADVANCE_TO_WORK_TYPE" && !remainderWorkTypeId) {
      setError("Please select a Work Type for the remainder advance.");
      return;
    }

    setIsSettling(true);
    setError(null);

    const payload = {
      userId: parseInt(userId),
      settlementDate: settlementDate
        ? settlementDate.toISOString()
        : new Date().toISOString(),
      allocations: allocations.map((a) => ({
        workTypeId: a.workTypeId,
        amount: a.amount,
        purpose: a.purpose,
      })),
      remainder: {
        action: remainderAction,
        workTypeId: remainderWorkTypeId,
      },
    };

    try {
      await ExpenseService.bulkSettleUntagged(payload);
      onSettlementComplete();
      onDismiss();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to process bulk settlement");
    } finally {
      setIsSettling(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const showRemainderSelection = remainder > 0 || allocations.length === 0;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ScrollView>
          <Text variant="headlineSmall" style={styles.title}>
            Smart Bulk Settlement
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
            Automatically allocate your untagged payments and other activities
            (Net:
            {formatCurrency(Math.round(untaggedTotal))}) to settle pending work
            types.
          </Text>

          {error && (
            <Text style={{ color: theme.colors.error, marginBottom: 8 }}>
              {error}
            </Text>
          )}

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                Auto-Allocations:
              </Text>
              {allocations.length === 0 ? (
                <Text style={{ marginTop: 8, fontStyle: "italic" }}>
                  No pending settlements found, or net is 0.
                </Text>
              ) : (
                allocations.map((a, index) => (
                  <View key={index} style={styles.allocationRow}>
                    <Text variant="bodyMedium">{a.workTypeName}</Text>
                    <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>
                      {formatCurrency(a.amount)} (Settlement)
                    </Text>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>

          <Card style={[styles.card, { marginTop: 16 }]}>
            <Card.Content>
              <View style={styles.allocationRow}>
                <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                  Remaining Untagged:
                </Text>
                <Text
                  variant="titleMedium"
                  style={{
                    fontWeight: "bold",
                    color: remainder > 0 ? theme.colors.primary : undefined,
                  }}
                >
                  {formatCurrency(remainder)}
                </Text>
              </View>

              {showRemainderSelection && (
                <View style={{ marginTop: 16 }}>
                  <Text variant="bodyMedium">
                    {remainder > 0
                      ? `What would you like to do with the remaining ${formatCurrency(remainder)}?`
                      : `Your untagged activities perfectly offset each other (Net: ₹0). Please select a Work Type to link these historical records to so they can be cleared.`}
                  </Text>
                  <RadioButton.Group
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onValueChange={(val) => setRemainderAction(val as any)}
                    value={remainderAction}
                  >
                    <RadioButton.Item
                      label="Leave as untagged (Legacy)"
                      value="LEAVE_UNTAGGED"
                    />
                    <RadioButton.Item
                      label={
                        remainder > 0
                          ? "Mark as Advance for Work Type..."
                          : "Link records to Work Type..."
                      }
                      value="ADVANCE_TO_WORK_TYPE"
                    />
                  </RadioButton.Group>

                  {remainderAction === "ADVANCE_TO_WORK_TYPE" && (
                    <Menu
                      visible={workTypeMenuVisible}
                      onDismiss={() => setWorkTypeMenuVisible(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setWorkTypeMenuVisible(true)}
                          style={{ marginTop: 8 }}
                        >
                          {remainderWorkTypeId
                            ? workTypes.find(
                                (wt) => wt.id === remainderWorkTypeId,
                              )?.name || "Select Work Type"
                            : "Select Work Type"}
                        </Button>
                      }
                    >
                      {workTypes.map((wt) => (
                        <Menu.Item
                          key={wt.id}
                          onPress={() => {
                            setRemainderWorkTypeId(wt.id!);
                            setWorkTypeMenuVisible(false);
                          }}
                          title={wt.name}
                        />
                      ))}
                    </Menu>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>

          <Card style={[styles.card, { marginTop: 16, marginBottom: 16 }]}>
            <Card.Content>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "bold", marginBottom: 8 }}
              >
                Settlement Date
              </Text>
              <Text variant="bodySmall" style={{ marginBottom: 12 }}>
                This date will be saved as the user&apos;s Opening Balance date
                for future reports.
              </Text>
              <DatePickerInput
                locale="en"
                label="Date"
                value={settlementDate}
                onChange={(d) => setSettlementDate(d)}
                inputMode="start"
              />
            </Card.Content>
          </Card>

          <View style={styles.actions}>
            <Button
              mode="text"
              onPress={onDismiss}
              disabled={isSettling}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={isSettling}
              disabled={
                isSettling ||
                (allocations.length === 0 &&
                  remainderAction !== "ADVANCE_TO_WORK_TYPE")
              }
              style={{ flex: 1 }}
            >
              Confirm
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: "90%",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  card: {
    marginTop: 8,
  },
  allocationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 8,
  },
});

export default SmartBulkSettleModal;
