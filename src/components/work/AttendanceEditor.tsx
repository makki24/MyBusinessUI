import { StyleSheet, View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import { IconButton, Switch, Text, useTheme } from "react-native-paper";
import React, { useState } from "react";
import { User, Work } from "../../../types";

interface AttendanceEditorProps {
  user: User;
  date: Date;
  work: Work;
  editWork: (user: User, key: string, value: string | number) => void;
}

const AttendanceEditor: React.FC<AttendanceEditorProps> = ({
  date,
  user,
  work,
  editWork,
}) => {
  const [fullDay, setFullDay] = useState(true);
  const [deleted, setDeleted] = useState(false);

  const actual = new Date(date);
  const formattedDate =
    actual.toLocaleString("default", { month: "short" }) +
    " " +
    String(actual.getDate()).padStart(2, "0");
  const theme = useTheme();

  const deleteWork = () => {
    if (!deleted) {
      let newQuantity;
      if (!fullDay) newQuantity = work.quantity - 0.5;
      else newQuantity = work.quantity - 1;

      editWork(user, "quantity", newQuantity);
    } else {
      let newQuantity;
      if (!fullDay) newQuantity = work.quantity + 0.5;
      else newQuantity = work.quantity + 1;

      editWork(user, "quantity", newQuantity);
    }

    setDeleted(!deleted);
  };

  const halfWork = (value) => {
    if (value) editWork(user, "quantity", work.quantity + 0.5);
    else editWork(user, "quantity", work.quantity - 0.5);
    setFullDay(value);
  };

  return (
    <View style={commonStyles.simpleRow}>
      <Switch
        value={fullDay}
        onValueChange={(value) => {
          halfWork(value);
        }}
      />
      <Text style={deleted ? styles.deleted : {}}>
        {fullDay ? `Full D` : `Half D`} {formattedDate}
      </Text>
      <IconButton
        onPress={() => deleteWork()}
        icon={"delete"}
        mode={"contained"}
        containerColor={theme.colors.tertiaryContainer}
        iconColor={theme.colors.tertiary}
        size={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  deleted: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
  },
});

export default AttendanceEditor;
