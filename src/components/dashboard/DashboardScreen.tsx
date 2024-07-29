import React, { useEffect, useRef, useState } from "react";
import dashboardService from "./DashboardService";
import { LineChart } from "react-native-gifted-charts";
import { ScrollView } from "react-native";
import LoadingError from "../../../components/common/LoadingError";
import commonAddScreenStyles from "../../styles/commonAddScreenStyles";
import { IconButton, useTheme } from "react-native-paper";
import { scaleValue } from "../../util/Calculation";

const DashboardScreen = () => {
  const [lineData1, setLineData1] = useState([]);
  const [lineData2, setLineData2] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const ref = useRef(null);
  const theme = useTheme();

  const getData = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getLineGraph();
      let min = 10000000000,
        max = 0;
      [...res.toPay, ...res.toReceive].forEach((toPay) => {
        if (toPay.value < min) {
          min = toPay.value;
        }
        if (toPay.value > max) {
          max = toPay.value;
        }
      });
      setLineData1(
        res.toPay.map((toPay) => ({
          ...toPay,
          dataPointRadius: 4,
          value: scaleValue(toPay.value, Math.floor(min), Math.ceil(max)),
        })),
      );
      setLineData2(
        res.toReceive.map((toPay) => ({
          ...toPay,
          dataPointRadius: 4,
          value: scaleValue(toPay.value, Math.floor(min), Math.ceil(max)),
        })),
      );
    } catch (e) {
      setError(e.message ?? "Can not draw graph");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    ref?.current?.scrollToEnd();
  }, [isLoading]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={commonAddScreenStyles.scrollViewContainer}
    >
      <LoadingError error={error} isLoading={isLoading} />
      <IconButton icon={"refresh"} mode={"contained"} onPress={getData} />
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
          textFontSize={15}
          hideYAxisText
          curved={true}
          onPress={() => {}}
          rotateLabel={true}
          xAxisLabelsVerticalShift={10}
          xAxisLabelTextStyle={{ color: theme.colors.onBackground }}
        />
      )}
    </ScrollView>
  );
};

export default DashboardScreen;
