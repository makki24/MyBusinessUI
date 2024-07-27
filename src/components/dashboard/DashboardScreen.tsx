import React, { useEffect, useRef, useState } from "react";
import dashboardService from "./DashboardService";
import { LineChart } from "react-native-gifted-charts";
import { ScrollView } from "react-native";
import LoadingError from "../../../components/common/LoadingError";
import commonAddScreenStyles from "../../styles/commonAddScreenStyles";

const logScale = (value) => Math.log2(value + 1);

const DashboardScreen = () => {
  const [lineData1, setLineData1] = useState([]);
  const [lineData2, setLineData2] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const ref = useRef(null);

  const getData = async () => {
    try {
      const res = await dashboardService.getLineGraph();
      setLineData1(
        res.toPay.map((entry) => ({ ...entry, value: logScale(entry.value) })),
      );
      setLineData2(
        res.toReceive.map((entry) => ({
          ...entry,
          value: logScale(entry.value),
        })),
      );
      setIsLoading(false);
    } catch (e) {
      setError(e.message ?? "Can not draw graph");
    }
  };

  useEffect(() => {
    ref?.current?.scrollToEnd();
  }, [ref]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={commonAddScreenStyles.scrollViewContainer}
    >
      <LoadingError error={error} isLoading={isLoading} />
      {!isLoading && (
        <LineChart
          data={lineData1}
          data2={lineData2}
          scrollRef={ref}
          color1="red"
          color2="blue"
          height={400}
          textColor1="black"
          textFontSize={13}
          hideYAxisText
          curved={true}
          rotateLabel={true}
          xAxisLabelsVerticalShift={10}
        />
      )}
    </ScrollView>
  );
};

export default DashboardScreen;
