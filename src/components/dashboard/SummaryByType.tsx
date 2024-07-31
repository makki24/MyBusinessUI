import React, { useEffect, useState } from "react";
import reportService from "../../../services/ReportService";
import CustomDateRange from "../common/CustomDateRange";
import { Text } from "react-native-paper";
import { View } from "react-native";
import commonStyles from "../../styles/commonStyles";

const SummaryByType = () => {
  const [result, setResult] = useState([]);
  const rangeState = React.useState({
    startDate: new Date("2022-12-20"),
    endDate: new Date(),
  });

  const getSummary = async () => {
    const res = await reportService.getSummaryByType(rangeState[0]);
    setResult(res);
  };

  useEffect(() => {
    getSummary();
  }, [rangeState[0]]);

  return (
    <View style={commonStyles.container}>
      <CustomDateRange rangeState={rangeState} />
      {result.map((value, index) => {
        return (
          <View style={commonStyles.row} key={index}>
            <Text>{value[0].name}</Text>
            <Text>{value[1]}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default SummaryByType;
