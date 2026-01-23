import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme, Switch, Text } from "react-native-paper";

interface SwitchInputProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const SwitchInput: React.FC<SwitchInputProps> = ({
  label,
  value,
  onValueChange,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: value ? theme.colors.primaryContainer + "30" : "transparent" }]}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        color={theme.colors.primary}
      />
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});

export default SwitchInput;

