import React from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { Chip, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { useColorScheme, View } from "react-native";

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
  onChangeValue?: (value: string | null) => void;
  zIndex?: number;
  zIndexInverse?: number;
  placeholder?: string;
  multiple?: boolean; // Added a new prop for multiple selections
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
  multiple = false, // Default to false if not provided
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
        containerStyle={{ height: 40, marginBottom: 16, ...containerStyle }}
        value={value}
        setValue={setValue}
        itemSeparator={itemSeparator}
        onChangeValue={onChangeValue}
        placeholder={placeholder}
        multiple={multiple} // Pass the multiple prop to DropDownPicker
        renderListItem={renderListItem}
        style={{
          borderRadius: 0,
          borderWidth: 0,
          backgroundColor: theme.colors.surfaceVariant,
        }}
        textStyle={{ color: theme.colors.onSurfaceVariant }}
        searchTextInputStyle={{
          backgroundColor: theme.colors.surfaceVariant,
          color: theme.colors.onSurfaceVariant,
        }}
        dropDownContainerStyle={{
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.onBackground,
        }}
        listItemLabelStyle={{ color: theme.colors.onBackground }}
        listMessageTextStyle={{ color: theme.colors.onBackground }}
        itemSeparatorStyle={{ backgroundColor: theme.colors.onBackground }}
        searchContainerStyle={{ borderBottomColor: theme.colors.onBackground }}
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {Array.isArray(value) &&
          value.map((v: string | number) => {
            const item = items.find(
              (itemLocal: T) => itemLocal[schema.value] === v,
            );
            return (
              <Chip
                key={v}
                onClose={() => handleDelete(v)}
                style={{ margin: 4 }}
              >
                {item ? item[schema.label] : "Loading..."}
              </Chip>
            );
          })}
      </View>
    </>
  );
};

export default CustomDropDown;
