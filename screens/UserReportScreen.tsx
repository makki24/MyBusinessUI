// src/screens/ReportScreen.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList } from "react-native";
import { useRecoilState } from "recoil";
import ReportItem from "../components/ReportItem";
import { userReportsState } from "../recoil/atom";
import ReportService from "../services/ReportService";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { IconButton, Text, TextInput } from "react-native-paper";
import Loading from "../src/components/common/Loading";
import NumberInput from "../components/common/NumberInput";
import SwitchInputDynamicLabel from "../src/components/common/SwitchInputDynamicLabel";
import { UI_ELEMENTS_GAP } from "../src/styles/constants";
import { REPORT_BACKGROUND_COLOR } from "../src/styles/colors";

interface UserReportScreenProps {
  navigation: NavigationProp<ParamListBase>;
  route: {
    params: {
      userId: number;
    };
  };
}
const UserReportScreen: React.FC<UserReportScreenProps> = ({ route }) => {
  const { userId } = route.params;
  const [reports, setReports] = useRecoilState(userReportsState);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of reports to load per request
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const isCashState = useState(true);
  const isPaidState = useState(true);

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

      if (!hasMore && !reset) return; // Prevent duplicate requests or loading beyond available data

      setIsRefreshing(true);

      // Fetch reports data from your service or API with pagination
      const reportsData = await ReportService.getReportByUser(
        userId,
        reset ? 0 : offset,
        limit,
      );

      // If there are no more items to load, set hasMore to false
      if (reportsData.length < limit) {
        setHasMore(false);
      }

      // Convert dates to Date objects and append or reset reports based on the reset flag
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
    fetchReports(true); // Initial fetch with reset
  }, []);

  const handleRefresh = () => {
    fetchReports(true); // Refresh with reset
  };

  const handleLoadMore = () => {
    if (error) return;
    fetchReports(); // Load next batch without reset
  };

  return (
    <>
      <View
        style={{
          ...commonStyles.container,
          backgroundColor: REPORT_BACKGROUND_COLOR,
        }}
      >
        <FlatList
          ListHeaderComponent={() => <View></View>}
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
          keyExtractor={(item, index) => `${index}`} // Ensure key is a string
          onEndReached={handleLoadMore} // Load more when reaching end of the list
          onEndReachedThreshold={0.5} // Trigger when scrolled halfway through the current data
        />
      </View>
      <View style={{ ...commonStyles.row, marginRight: UI_ELEMENTS_GAP }}>
        <SwitchInputDynamicLabel
          valueState={isPaidState}
          trueLabel={"You Paid"}
          falseLabel={"You received"}
        />
        <Text>
          {" "}
          Adding{" "}
          {isPaidState[0]
            ? isCashState[0]
              ? "Expense (Transfer)"
              : "Sale"
            : isCashState[0]
              ? "Contribution"
              : "Work"}
        </Text>
        <SwitchInputDynamicLabel
          valueState={isCashState}
          trueLabel={"Cash"}
          falseLabel={"Cash less"}
        />
      </View>

      {amount && (
        <TextInput
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={2}
        />
      )}
      <View style={commonStyles.row}>
        <View style={{ width: "75%" }}>
          <NumberInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            disabled={true}
          />
        </View>
        <View style={commonStyles.simpleRow}>
          <IconButton
            icon={"send"}
            mode={"contained"}
            disabled={!amount}
            onPress={() => {}}
          />
          <IconButton
            icon={"refresh"}
            mode={"contained"}
            onPress={handleRefresh}
          />
        </View>
      </View>
    </>
  );
};

export default UserReportScreen;
