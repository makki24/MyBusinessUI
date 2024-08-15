import { DatePickerInput } from "react-native-paper-dates";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import { View } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import { Range } from "../users/report-summary.model";

interface CustomDateRangeProps {
  rangeState: [Range, Dispatch<SetStateAction<Range>>];
}

const CustomDateRange: React.FC<CustomDateRangeProps> = ({ rangeState }) => {
  const [range, setRange] = rangeState;

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <DatePickerInput
        locale="en-GB"
        label={"Start Date"}
        withDateFormatInLabel={false}
        value={range.startDate}
        onChange={(d) => {
          if (range.endDate && range.endDate < d) range.endDate = d;
          setRange({ ...range, startDate: d });
        }}
        inputMode="start"
      />
      <DatePickerInput
        style={{ marginLeft: UI_ELEMENTS_GAP / 2 }}
        locale="en-GB"
        value={range.endDate}
        validRange={{ startDate: range.startDate }}
        onChange={(d) => {
          setRange({ ...range, endDate: d });
        }}
        inputMode="start"
        label={"End Date"}
        withDateFormatInLabel={false}
      />
    </View>
  );
};

export default CustomDateRange;
