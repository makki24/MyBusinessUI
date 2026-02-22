import React, { useEffect, useState } from "react";
import { User } from "../../../types";
import { Icon, Text, useTheme } from "react-native-paper";
import commonStyles from "../../styles/commonStyles";
import { ScrollView, TouchableOpacity, View } from "react-native";
import UserRemainingAmount from "../common/UserRemainingAmount";
import { REPORT_ICON_SIZE, UI_ELEMENTS_GAP } from "../../styles/constants";
import userService from "./UserService";
import LoadingError from "../../../components/common/LoadingError";
import CustomDateRange from "../common/CustomDateRange";
import { UserSummaryByType } from "./report-summary.model";

interface UserSummaryProps {
  route: {
    params: {
      user: User;
    };
  };
}

interface SummaryProps {
  summary: UserSummaryByType[];
  total: number;
  testId: string;
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

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const rangeState = React.useState({
    startDate: thisMonth,
    endDate: new Date(),
  });
  const [range] = rangeState;
  const [user] = useState<User>(userParam);
  const toRecieve = user.amountHolding > user.amountToReceive;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const [snackMessage, setSnackMessage] = useState("");
  const [receivedSummary, setReceivedSummary] = useState<UserSummaryByType[]>(
    [],
  );
  const [sentSummary, setSentSummary] = useState<UserSummaryByType[]>([]);
  const [totalSent, setTotalSent] = useState<number>();
  const [totalReceived, setTotalReceived] = useState<number>();

  const downloadReport = async () => {
    try {
      setIsLoading(true);
      const res = await userService.sendSummaryToMail({
        range,
        user,
      });
      setSnackMessage(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserSummary = async () => {
    try {
      setIsLoading(true);
      const res = await userService.getSummaryByUser({
        range,
        user,
      });
      setReceivedSummary(res.received);
      setSentSummary(res.sent);
      const newTotalReceived: number = res.received.reduce(
        (a, b) => a + b.amount,
        0,
      );
      const newTotalSent: number = res.sent.reduce((a, b) => a + b.amount, 0);
      setTotalReceived(newTotalReceived);
      setTotalSent(newTotalSent);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserSummary();
  }, [range]);

  const Summary: React.FC<SummaryProps> = ({ summary, total, testId }) => {
    return (
      <>
        {summary.map((item, index) => {
          return (
            <View key={index + testId} style={commonStyles.row}>
              <Text>{item.type.name}</Text>
              <Text>{item.amount}</Text>
            </View>
          );
        })}
        <View style={commonStyles.row}>
          <Text variant={"titleSmall"}>Total</Text>
          <Text variant={"titleSmall"}>{total}</Text>
        </View>
      </>
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
      <CustomDateRange rangeState={rangeState} />
      <ScrollView>
        <View
          style={{ ...commonStyles.simpleRow, marginVertical: UI_ELEMENTS_GAP }}
        >
          <TouchableOpacity
            onPress={downloadReport}
            style={{ ...commonStyles.simpleRow, marginLeft: UI_ELEMENTS_GAP }}
          >
            <Icon
              source={"email-send"}
              color={theme.colors.primary}
              size={REPORT_ICON_SIZE}
            />
            <Text>Send report to mail</Text>
          </TouchableOpacity>
        </View>
        <Text variant={"titleMedium"}>
          Total work & amount received from {user.name}
        </Text>
        <Summary
          summary={sentSummary}
          total={totalSent}
          testId={"sentSummary"}
        />
        <Text>{""}</Text>
        <Text variant={"titleMedium"}>Total paid to {user.name}</Text>
        <Summary
          summary={receivedSummary}
          total={totalReceived}
          testId={"receivedSummary"}
        />
        <Text>{""}</Text>
        <View style={commonStyles.row}>
          <Text variant={"titleMedium"}>Difference</Text>
          <Text>{totalReceived - totalSent}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default UserSummary;
