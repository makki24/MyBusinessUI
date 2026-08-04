import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text, Icon, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { useColorScheme } from "react-native";
import { WorkType } from "../../../../types";
import { UI_ELEMENTS_GAP } from "../../../styles/constants";

interface WorkTypeDropDownItemProps {
  item: WorkType;
  selectedWorkType: number | string | null;
  setWorkType: (wt: WorkType) => void;
  setOpen: (open: boolean) => void;
}

const WorkTypeDropDownItem: React.FC<WorkTypeDropDownItemProps> = ({
  item,
  selectedWorkType,
  setWorkType,
  setOpen,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;

  const isSelected = selectedWorkType === item.id;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? theme.colors.primaryContainer
            : theme.colors.background,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
      onPress={() => {
        setWorkType(item);
        setOpen(false);
      }}
    >
      <View style={styles.leftContent}>
        <Text
          variant="bodyLarge"
          style={{ fontWeight: isSelected ? "bold" : "normal" }}
        >
          {item.name}
        </Text>
      </View>

      <View style={styles.middleContent}>
        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
          {item.unit && item.pricePerUnit
            ? `Per ${item.unit} : ${item.pricePerUnit}`
            : item.pricePerUnit || ""}
        </Text>
      </View>

      <View style={styles.rightContent}>
        <View
          style={[styles.iconContainer, { borderColor: theme.colors.outline }]}
        >
          <Icon
            source="calendar-blank"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: UI_ELEMENTS_GAP,
    borderBottomWidth: 1,
  },
  leftContent: {
    flex: 2,
  },
  middleContent: {
    flex: 2,
    alignItems: "center",
  },
  rightContent: {
    flex: 1,
    alignItems: "flex-end",
  },
  iconContainer: {
    borderWidth: 1,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default WorkTypeDropDownItem;
