import * as React from "react";
import { BottomNavigation, Text } from "react-native-paper";
import LineChartScreen from "./LineChartScreen";
import SummaryByType from "./SummaryByType";
import reportService from "../../../services/ReportService";

const NotificationsRoute = () => <Text>Notifications</Text>;

const ExpenseSummary = () => {
  return <SummaryByType api={reportService.getExpenseSummaryByType} />;
};

const WorkSummary = () => {
  return <SummaryByType api={reportService.getWorkSummaryByType} />;
};

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
    byExpenseType: ExpenseSummary,
    lineChart: LineChartScreen,
    byWorkType: WorkSummary,
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
