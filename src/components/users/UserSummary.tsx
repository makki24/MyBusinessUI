import React, { useState } from "react";
import { User } from "../../../types";
import { Icon, Text, useTheme } from "react-native-paper";
import commonStyles from "../../styles/commonStyles";
import { TouchableOpacity, View } from "react-native";
import UserRemainingAmount from "../common/UserRemainingAmount";
import { REPORT_ICON_SIZE, UI_ELEMENTS_GAP } from "../../styles/constants";
import userService from "./UserService";
import LoadingError from "../../../components/common/LoadingError";
import SecondaryButton from "../../../components/common/SecondaryButton";
import CustomDateRange from "../common/CustomDateRange";

interface UserSummaryProps {
  userProp: User;
  close: () => void;
}

const UserSummary: React.FC<UserSummaryProps> = ({ userProp, close }) => {
  const rangeState = React.useState({
    startDate: new Date("2022-12-20"),
    endDate: new Date(),
  });
  const [range] = rangeState;
  const [user] = useState<User>(userProp);
  const toRecieve = user.amountHolding > user.amountToReceive;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const [snackMessage, setSnackMessage] = useState("");

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

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />
      <Text>{snackMessage}</Text>
      <CustomDateRange rangeState={rangeState} />
      <View
        style={{ ...commonStyles.simpleRow, marginVertical: UI_ELEMENTS_GAP }}
      >
        <Text variant={"titleLarge"}>
          {toRecieve ? "To Receive" : "To Pay"} :{" "}
        </Text>
        <UserRemainingAmount user={user} />
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

      <SecondaryButton
        icon={"close"}
        style={{ width: "30%" }}
        title={"Close"}
        onPress={close}
        mode={"outlined"}
      />
    </View>
  );
};

export default UserSummary;
