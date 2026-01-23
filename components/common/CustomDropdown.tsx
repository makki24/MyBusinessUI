import React from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { Chip, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { useColorScheme, View, StyleSheet } from "react-native";

interface CustomDropDownProps<T> {
  schema?: {
    label: string;
    value: string;
  };
  items: Array<T>;
  searchable?: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  containerStyle?: object;
  value: string | string[] | number[] | number;
  setValue: React.Dispatch<
    React.SetStateAction<string | string[] | number[] | number>
  >;
  itemSeparator?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChangeValue?: (value: any) => void;
  zIndex?: number;
  zIndexInverse?: number;
  placeholder?: string;
  multiple?: boolean;
  loading?: boolean;
  renderListItem?;
  testID?: string;
}

const CustomDropDown = <T,>({
  items,
  schema,
  searchable = true,
  open,
  setOpen,
  containerStyle,
  value,
  setValue,
  itemSeparator,
  onChangeValue,
  zIndex,
  zIndexInverse,
  placeholder,
  multiple = false,
  loading = false,
  renderListItem,
  testID,
}: CustomDropDownProps<T>) => {
  const handleDelete = (itemValue: string | number) => {
    setValue((prevValue: string[]) =>
      prevValue.filter((v: string) => v !== itemValue),
    );
  };

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const isDark = colorScheme === "dark";

  return (
    <>
      <DropDownPicker
        testID={testID}
        loading={loading}
        schema={schema}
        zIndex={zIndex}
        zIndexInverse={zIndexInverse}
        items={items}
        searchable={searchable}
        open={open}
        setOpen={setOpen}
        containerStyle={{ height: 50, marginBottom: 12, ...containerStyle }}
        value={value}
        setValue={setValue}
        itemSeparator={itemSeparator}
        onChangeValue={onChangeValue}
        placeholder={placeholder}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        multiple={multiple as any}
        renderListItem={renderListItem}
        // Modern rounded style
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
          backgroundColor: theme.colors.surface,
          minHeight: 50,
          paddingHorizontal: 14,
        }}
        textStyle={{
          color: theme.colors.onSurface,
          fontSize: 15,
          fontWeight: "500",
        }}
        placeholderStyle={{
          color: theme.colors.onSurfaceVariant,
          fontSize: 15,
        }}
        arrowIconStyle={{
          width: 20,
          height: 20,
        }}
        tickIconStyle={{
          width: 18,
          height: 18,
        }}
        // Search input styling
        searchTextInputStyle={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.onSurface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          paddingHorizontal: 12,
          height: 44,
        }}
        searchContainerStyle={{
          borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          paddingBottom: 10,
        }}
        // Dropdown container styling
        dropDownContainerStyle={{
          backgroundColor: theme.colors.surface,
          borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
          borderRadius: 12,
          borderWidth: 1,
          marginTop: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.15,
          shadowRadius: 8,
          elevation: 8,
        }}
        // List item styling
        listItemContainerStyle={{
          height: 52,
          paddingHorizontal: 14,
        }}
        listItemLabelStyle={{
          color: theme.colors.onSurface,
          fontSize: 15,
        }}
        selectedItemContainerStyle={{
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : theme.colors.primaryContainer,
        }}
        selectedItemLabelStyle={{
          color: theme.colors.primary,
          fontWeight: "600",
        }}
        listMessageTextStyle={{
          color: theme.colors.onSurfaceVariant,
          fontSize: 14,
        }}
        itemSeparatorStyle={{
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        }}
        maxHeight={280}
        searchPlaceholder="Search..."
        listMode="SCROLLVIEW"
      />
      {/* Selected chips for multiple selection */}
      {Array.isArray(value) && value.length > 0 && (
        <View style={styles.chipContainer}>
          {value.map((v: string | number) => {
            const item = items.find(
              (itemLocal: T) => itemLocal[schema.value] === v,
            );
            return (
              <Chip
                key={v}
                onClose={() => handleDelete(v)}
                style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
                textStyle={{ color: theme.colors.onPrimaryContainer, fontSize: 13 }}
                closeIconAccessibilityLabel="Remove"
              >
                {item ? item[schema.label] : "Loading..."}
              </Chip>
            );
          })}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 8,
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
    borderRadius: 16,
  },
});

export default CustomDropDown;

