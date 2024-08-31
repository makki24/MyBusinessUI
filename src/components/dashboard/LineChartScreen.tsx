import React, { useEffect, useRef, useState } from "react";
import dashboardService from "./DashboardService";
import { LineChart } from "react-native-gifted-charts";
import { ScrollView, View } from "react-native";
import LoadingError from "../../../components/common/LoadingError";
import commonAddScreenStyles from "../../styles/commonAddScreenStyles";
import { IconButton, useTheme, Text } from "react-native-paper";
import commonStyles from "../../styles/commonStyles";
import { DatePickerInput } from "react-native-paper-dates";
import reportService from "../../../services/ReportService";
import { UI_ELEMENTS_GAP } from "../../styles/constants";

const LineChartScreen = () => {
  const [lineData1, setLineData1] = useState([]);
  const [lineData2, setLineData2] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [netAmount, setNetAmount] = useState(null);
  const ref = useRef(null);
  const theme = useTheme();
  const fourMonthsAgo = new Date();
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
  const [inputDate, setInputDate] = useState(fourMonthsAgo);

  const getData = async () => {
    setError("");
    setIsLoading(true);
    try {
      const res = await dashboardService.getLineGraph(inputDate);
      setLineData1(res.toPay);
      setLineData2(res.toReceive);
    } catch (e) {
      setError(e.message ?? "Can not draw graph");
    } finally {
      setIsLoading(false);
    }
  };

  const getAmountNet = async () => {
    try {
      const res = await reportService.getAmountNet();
      setNetAmount(res);
    } catch (e) {
      e;
    }
  };

  useEffect(() => {
    ref?.current?.scrollToEnd();
  }, [isLoading]);

  useEffect(() => {
    getData();
  }, [inputDate]);

  useEffect(() => {
    getAmountNet();
  }, []);

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />
      <View style={commonStyles.simpleRow}>
        <IconButton
          disabled={isLoading}
          icon={"refresh"}
          mode={"contained"}
          onPress={getData}
        />
        <DatePickerInput
          locale="en"
          label="From date"
          value={inputDate}
          onChange={(d) => setInputDate(d || new Date())}
          inputMode="start"
          style={commonAddScreenStyles.inputField}
        />
      </View>
      <ScrollView
        contentContainerStyle={commonAddScreenStyles.scrollViewContainer}
      >
        {!isLoading && (
          <LineChart
            data={lineData1}
            data2={lineData2}
            scrollRef={ref}
            color1={theme.colors.error}
            color2={theme.colors.primary}
            height={400}
            textColor1={theme.colors.onBackground}
            textColor2={theme.colors.onSurfaceVariant}
            dataPointsColor1={theme.colors.onBackground}
            textFontSize={15}
            hideYAxisText
            maxValue={21}
            curved={true}
            onPress={() => {}}
            rotateLabel={true}
            xAxisLabelsVerticalShift={10}
            xAxisLabelTextStyle={{ color: theme.colors.onBackground }}
          />
        )}
        {netAmount && (
          <View style={{ marginTop: UI_ELEMENTS_GAP * 2 }}>
            <Text style={{ color: theme.colors.error }}>
              Total to pay {netAmount.totalToPay}
            </Text>
            <Text style={{ color: theme.colors.primary }}>
              Total to receive {netAmount.totalToReceive}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default LineChartScreen;
