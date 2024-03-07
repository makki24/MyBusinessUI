import React from "react";
import { IconButton, TextInput, useTheme } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { View } from "react-native";
import commonStyles from "../../src/styles/commonStyles";

interface Range {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  range: Range;
  setRange: React.Dispatch<React.SetStateAction<Range>>;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  range,
  setRange,
}) => {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();

  const onDismiss = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = React.useCallback(
    ({ startDate, endDate }) => {
      setOpen(false);
      setRange({ startDate, endDate });
    },
    [setOpen, setRange],
  );

  const clearDate = () => {
    setRange({ startDate: undefined, endDate: undefined });
  };

  return (
    <>
      <View style={commonStyles.row}>
        <View onTouchEnd={() => setOpen(true)} style={{ width: "80%" }}>
          <TextInput
            label="Pick range"
            value={
              range.startDate
                ? range.endDate
                  ? `${range.startDate.toDateString()} - ${range.endDate.toDateString()}`
                  : `${range.startDate.toDateString()} - ${new Date().toDateString()}`
                : ""
            }
            editable={false}
            style={{ borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
          />
        </View>
        <View
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            borderBottomWidth: 0.65,
            width: "20%",
            borderColor: theme.colors.onSurfaceVariant,
            alignItems: "center",
          }}
        >
          <IconButton
            icon="close"
            // mode={'contained'}
            size={25}
            onPress={clearDate}
          />
        </View>
      </View>
      <DatePickerModal
        locale="en"
        mode="range"
        visible={open}
        onDismiss={onDismiss}
        startDate={range.startDate}
        endDate={range.endDate}
        onConfirm={onConfirm}
      />
    </>
  );
};

export default DateRangePicker;
