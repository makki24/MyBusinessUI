import * as React from "react";
import { BottomNavigation, Text } from "react-native-paper";
import LineChartScreen from "./LineChartScreen";
import SummaryByType from "./SummaryByType";
import reportService from "../../../services/ReportService";

const NotificationsRoute = () => <Text>Notifications</Text>;

const DashboardScreen = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: "lineChart",
      title: "Line Chart",
      focusedIcon: "heart",
      unfocusedIcon: "heart-outline",
    },
    { key: "byExpenseType", title: "Expense summary", focusedIcon: "album" },
    { key: "byWorkType", title: "Work summary", focusedIcon: "album" },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    lineChart: LineChartScreen,
    byExpenseType: () => (
      <SummaryByType api={reportService.getExpenseSummaryByType} />
    ),
    byWorkType: () => (
      <SummaryByType api={reportService.getWorkSummaryByType} />
    ),
    notifications: NotificationsRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};

export default DashboardScreen;
