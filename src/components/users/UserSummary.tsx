import React, { useEffect, useState } from "react";
import { User } from "../../../types";
import { Icon, Text, useTheme, Card, Divider } from "react-native-paper";
import commonStyles from "../../styles/commonStyles";
import { ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import UserRemainingAmount from "../common/UserRemainingAmount";
import { REPORT_ICON_SIZE, UI_ELEMENTS_GAP } from "../../styles/constants";
import userService from "./UserService";
import LoadingError from "../../../components/common/LoadingError";
import BalanceService, {
  UserBalance,
  WorkTypeBalance,
} from "../../../services/BalanceService";

interface UserSummaryProps {
  route: {
    params: {
      user: User;
    };
  };
}

const UserSummary: React.FC<UserSummaryProps> = ({ route }) => {
  const userParam = route.params?.user;

  if (!userParam) {
    return (
      <View style={commonStyles.container}>
        <Text>No user data provided.</Text>
      </View>
    );
  }

  const [user] = useState<User>(userParam);
  const [balanceData, setBalanceData] = useState<UserBalance | null>(null);
  const toRecieve = balanceData ? balanceData.netBalance < 0 : false;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const [snackMessage, setSnackMessage] = useState("");

  const downloadReport = async () => {
    try {
      setIsLoading(true);
      const res = await userService.sendSummaryToMail({
        range: { startDate: new Date(0), endDate: new Date() }, // Default to all time
        user,
      });
      setSnackMessage(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getBalanceData = async () => {
    try {
      setIsLoading(true);
      if (user.id) {
        const res = await BalanceService.getUserBalance(user.id);
        setBalanceData(res);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBalanceData();
  }, [user.id]);

  const formatCurrency = (amount: number) => {
    if (amount < 0) {
      return `-₹${Math.abs(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    }
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const renderWorkTypeCard = (wtb: WorkTypeBalance, index: number) => {
    const isOwed = wtb.netBalance > 0;

    return (
      <Card key={index} style={styles.card} mode="outlined">
        <Card.Title title={wtb.workTypeName} />
        <Card.Content>
          <View style={styles.row}>
            <Text variant="bodyMedium">📦 Work Done:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {wtb.totalWorkQty} {wtb.unit} ={" "}
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
                📎 Untagged:
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
          <View style={styles.row}>
            <Text variant="titleSmall" style={{ fontWeight: "bold" }}>
              Net for {wtb.workTypeName}:
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
              {formatCurrency(wtb.netBalance)} {isOwed ? "(owed)" : "(advance)"}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />
      <Text>{snackMessage}</Text>

      <View style={commonStyles.simpleRow}>
        <Text variant={"titleLarge"}>
          {toRecieve ? "To Receive" : "To Pay"} :{" "}
        </Text>
        <UserRemainingAmount user={user} />
      </View>

      <ScrollView>
        <View
          style={{ ...commonStyles.simpleRow, marginVertical: UI_ELEMENTS_GAP }}
        >
          <TouchableOpacity
            onPress={downloadReport}
            style={{ ...commonStyles.simpleRow, marginLeft: UI_ELEMENTS_GAP }}
          >
            <Icon
              source={"email"}
              color={theme.colors.primary}
              size={REPORT_ICON_SIZE}
            />
            <Text>Send full report to mail</Text>
          </TouchableOpacity>
        </View>

        {balanceData && (
          <View style={{ paddingHorizontal: UI_ELEMENTS_GAP }}>
            <Text variant="titleMedium" style={{ marginBottom: 4 }}>
              Overall Breakdown
            </Text>
            {user.lastSettlementDate ? (
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.outline,
                  marginBottom: UI_ELEMENTS_GAP,
                }}
              >
                Last settled on:{" "}
                {new Date(user.lastSettlementDate).toLocaleDateString("en-GB")}
              </Text>
            ) : (
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.outline,
                  marginBottom: UI_ELEMENTS_GAP,
                }}
              >
                All Time
              </Text>
            )}

            {balanceData.workTypeBalances?.map((wtb, idx) =>
              renderWorkTypeCard(wtb, idx),
            )}

            {balanceData.untaggedPayments > 0 && (
              <Card style={styles.card} mode="outlined">
                <Card.Title title="📎 Untagged Payments (Old)" />
                <Card.Content>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.outline }}
                  >
                    {formatCurrency(balanceData.untaggedPayments)} in payments
                    from before advance tracking was added. These are included
                    in the overall net but not categorized by work type.
                  </Text>
                </Card.Content>
              </Card>
            )}

            {(balanceData.expensesSent > 0 ||
              balanceData.sales > 0 ||
              balanceData.contributionsSent > 0 ||
              balanceData.contributionsReceived > 0) && (
              <Card style={styles.card} mode="outlined">
                <Card.Title
                  title="Other Activities (دیگر)"
                  subtitle="Transactions not related to work types"
                />
                <Card.Content>
                  {balanceData.expensesSent > 0 && (
                    <View style={styles.row}>
                      <Text variant="bodyMedium">
                        💸 Expenses Paid by User:
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={[styles.value, { color: theme.colors.primary }]}
                      >
                        + {formatCurrency(balanceData.expensesSent)}
                      </Text>
                    </View>
                  )}
                  {balanceData.contributionsSent > 0 && (
                    <View style={styles.row}>
                      <Text variant="bodyMedium">🎁 Contributions Sent:</Text>
                      <Text
                        variant="bodyMedium"
                        style={[styles.value, { color: theme.colors.primary }]}
                      >
                        + {formatCurrency(balanceData.contributionsSent)}
                      </Text>
                    </View>
                  )}
                  {balanceData.sales > 0 && (
                    <View style={styles.row}>
                      <Text variant="bodyMedium">
                        🛒 Sales Collected by User:
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={[styles.value, { color: theme.colors.error }]}
                      >
                        - {formatCurrency(balanceData.sales)}
                      </Text>
                    </View>
                  )}
                  {balanceData.contributionsReceived > 0 && (
                    <View style={styles.row}>
                      <Text variant="bodyMedium">
                        📥 Contributions Received:
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={[styles.value, { color: theme.colors.error }]}
                      >
                        - {formatCurrency(balanceData.contributionsReceived)}
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
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: UI_ELEMENTS_GAP,
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
});

export default UserSummary;
