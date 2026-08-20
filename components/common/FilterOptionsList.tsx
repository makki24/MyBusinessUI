// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { View, TouchableOpacity, FlatList } from "react-native";
import { Text, Searchbar, Checkbox, useTheme } from "react-native-paper";
import React, { Dispatch, SetStateAction, useState, useMemo } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import commonItemStyles from "../../src/styles/commonItemStyles";

interface Item {
  id?: string | number;
  name: string;
}

interface FilterOptionsListProps<T extends Item> {
  items: T[];
  setSelectedChips?: Dispatch<SetStateAction<T[]>>;
  selectedChips?: T[];
}

const FilterOptionsList = <T extends Item>({
  items,
  setSelectedChips,
  selectedChips = [],
}: FilterOptionsListProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const theme = useTheme();

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [items, searchQuery]);

  const toggleSelection = (item: T) => {
    if (setSelectedChips) {
      let updated;
      if (selectedChips.some((selectedItem) => selectedItem.id === item.id)) {
        updated = selectedChips.filter(
          (selectedItem) => selectedItem.id !== item.id,
        );
      } else {
        updated = [...selectedChips, item];
      }
      setSelectedChips(updated);
    }
  };

  const renderItem = ({ item }: { item: T }) => {
    const isSelected = selectedChips.some(
      (selectedItem) => selectedItem.id === item.id,
    );
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outlineVariant,
        }}
        onPress={() => toggleSelection(item)}
      >
        <Text style={{ flex: 1, paddingRight: 8 }}>{item.name}</Text>
        <Checkbox.Android
          status={isSelected ? "checked" : "unchecked"}
          onPress={() => toggleSelection(item)}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {items.length > 8 && (
        <Searchbar
          placeholder="Search..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            height: 40,
            marginBottom: 12,
            backgroundColor: theme.colors.surfaceVariant,
            elevation: 0,
          }}
          inputStyle={{ minHeight: 40, paddingBottom: 0 }}
        />
      )}
      {/* Do not use FlatList inside BottomSheetScrollView if there are issues, but since this right pane will contain ONLY this, it should be fine. Actually, using .map is safer inside BottomSheetScrollView. Let's use map since we already paginate/filter, or just map. Or better, we can replace BottomSheetScrollView in the right pane with just View, and let FlatList handle scrolling! */}
      {filteredItems.map((item) => (
        <View key={item.id}>{renderItem({ item })}</View>
      ))}
    </View>
  );
};

export default FilterOptionsList;
