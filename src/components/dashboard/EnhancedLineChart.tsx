import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text, useTheme, Chip, Menu, Button } from "react-native-paper";
import { LineChart } from "react-native-gifted-charts";
import DashBoardService from "./DashboardService";
import LoadingError from "../../../components/common/LoadingError";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import { useRecoilValue } from "recoil";
import { usersState } from "../../../recoil/atom";

interface TimePeriod {
  label: string;
  months: number;
}

const TIME_PERIODS: TimePeriod[] = [
  { label: "7D", months: 0.25 },
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
];

const EnhancedLineChart: React.FC = () => {
  const theme = useTheme();
  const users = useRecoilValue(usersState);

  const [lineData1, setLineData1] = useState([]);
  const [lineData2, setLineData2] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    TIME_PERIODS[2],
  ); // Default 3M
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("All Users");
  const [menuVisible, setMenuVisible] = useState(false);

  const calculateFromDate = (months: number): Date => {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date;
  };

  const getData = async () => {
    setError("");
    setIsLoading(true);
    try {
      const fromDate = calculateFromDate(selectedPeriod.months);
      let res;

      if (selectedUserId) {
        res = await DashBoardService.getLineGraphByUser(
          Number(selectedUserId),
          fromDate,
        );
      } else {
        res = await DashBoardService.getLineGraph(fromDate);
      }

      setLineData1(res.toPay || []);
      setLineData2(res.toReceive || []);
    } catch (e) {
      setError(e.message ?? "Cannot draw graph");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [selectedPeriod, selectedUserId]);

  const handleUserSelect = (userId: string | null, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setMenuVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Transactions Over Time
      </Text>

      {/* Time Period Selection */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodContainer}
      >
        {TIME_PERIODS.map((period) => (
          <Chip
            key={period.label}
            selected={selectedPeriod.label === period.label}
            onPress={() => setSelectedPeriod(period)}
            style={[
              styles.periodChip,
              selectedPeriod.label === period.label && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            textStyle={
              selectedPeriod.label === period.label
                ? { color: theme.colors.onPrimaryContainer, fontWeight: "bold" }
                : { color: theme.colors.onSurface }
            }
          >
            {period.label}
          </Chip>
        ))}
      </ScrollView>

      {/* User Filter */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            icon="account"
            style={styles.userFilter}
          >
            {selectedUserName}
          </Button>
        }
        contentStyle={styles.menuContent}
      >
        <Menu.Item
          onPress={() => handleUserSelect(null, "All Users")}
          title="All Users"
          leadingIcon={selectedUserId === null ? "check" : undefined}
        />
        {users?.map((user) => (
          <Menu.Item
            key={user.id}
            onPress={() => handleUserSelect(user.id, user.name)}
            title={user.name}
            leadingIcon={selectedUserId === user.id ? "check" : undefined}
          />
        ))}
      </Menu>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LoadingError error={error} isLoading={isLoading} />

        {!isLoading && lineData1.length > 0 && (
          <>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: theme.colors.error },
                  ]}
                />
                <Text
                  style={[styles.legendText, { color: theme.colors.onSurface }]}
                >
                  To Pay
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
                <Text
                  style={[styles.legendText, { color: theme.colors.onSurface }]}
                >
                  To Receive
                </Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={lineData1}
                data2={lineData2}
                color1={theme.colors.error}
                color2={theme.colors.primary}
                height={280}
                textColor1={theme.colors.onBackground}
                textColor2={theme.colors.onSurfaceVariant}
                dataPointsColor1={theme.colors.error}
                dataPointsColor2={theme.colors.primary}
                textFontSize={12}
                hideYAxisText
                maxValue={21}
                curved={true}
                areaChart
                startFillColor1={theme.colors.error}
                endFillColor1="transparent"
                startOpacity1={0.3}
                endOpacity1={0}
                startFillColor2={theme.colors.primary}
                endFillColor2="transparent"
                startOpacity2={0.3}
                endOpacity2={0}
                rotateLabel={true}
                xAxisLabelsVerticalShift={10}
                xAxisLabelTextStyle={{
                  color: theme.colors.onSurface,
                  fontSize: 10,
                }}
                spacing={50}
                initialSpacing={20}
              />
            </ScrollView>
          </>
        )}

        {!isLoading && lineData1.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No data available for this period
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: UI_ELEMENTS_GAP,
    marginVertical: UI_ELEMENTS_GAP / 2,
    padding: UI_ELEMENTS_GAP,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: UI_ELEMENTS_GAP,
  },
  periodContainer: {
    flexDirection: "row",
    marginBottom: UI_ELEMENTS_GAP,
  },
  periodChip: {
    marginRight: 8,
  },
  userFilter: {
    marginBottom: UI_ELEMENTS_GAP,
    alignSelf: "flex-start",
  },
  menuContent: {
    maxHeight: 300,
  },
  chartContainer: {
    minHeight: 320,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: UI_ELEMENTS_GAP,
    gap: UI_ELEMENTS_GAP * 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  emptyState: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EnhancedLineChart;
