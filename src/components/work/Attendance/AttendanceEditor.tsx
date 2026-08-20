import { StyleSheet, View } from "react-native";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import commonStyles from "../../../styles/commonStyles";
import { IconButton, Switch, Text, useTheme } from "react-native-paper";
import React, { useState } from "react";
import { User, Work } from "../../../../types";

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
    <View
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}
    >
      <Switch
        value={fullDay}
        onValueChange={(value) => halfWork(value)}
        disabled={deleted}
      />
      <Text
        style={[
          { flex: 1, marginLeft: 12 },
          deleted ? styles.deleted : { color: theme.colors.onSurface },
        ]}
      >
        {fullDay ? `Full Day` : `Half Day`} • {formattedDate}
      </Text>
      <IconButton
        onPress={() => deleteWork()}
        icon={deleted ? "restore" : "delete"}
        mode={"contained-tonal"}
        containerColor={
          deleted ? theme.colors.surfaceVariant : theme.colors.errorContainer
        }
        iconColor={deleted ? theme.colors.onSurfaceVariant : theme.colors.error}
        size={18}
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
