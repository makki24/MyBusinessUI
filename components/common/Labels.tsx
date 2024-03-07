import commonItemStyles from "../../src/styles/commonItemStyles";
import { View } from "react-native";
import { Chip, Text } from "react-native-paper";
import React, { Dispatch, SetStateAction, useState } from "react";

interface Item {
  id?: string | number;
  name: string;
}

interface LabelListProps<T extends Item> {
  items: T[];
  label: string;
  setSelectedChips?: Dispatch<SetStateAction<T[]>>;
  selectedChips?: T[];
}
const Labels: React.FC<LabelListProps<Item>> = ({
  items,
  label,
  setSelectedChips,
  selectedChips,
}) => {
  const handleChipPress = (item: Item) => {
    if (setSelectedChips) {
      let updatedSelectedChips;

      if (selectedChips.some((selectedItem) => selectedItem.id === item.id)) {
        // If item is already selected, remove it
        updatedSelectedChips = selectedChips.filter(
          (selectedItem) => selectedItem.id !== item.id,
        );
      } else {
        // If item is not selected, add it
        updatedSelectedChips = [...selectedChips, item];
      }

      setSelectedChips(updatedSelectedChips);
    }
  };

  return (
    <View style={commonItemStyles.tagsContainer}>
      <Text variant="titleSmall">{label}: </Text>
      <View style={commonItemStyles.tagChipsContainer}>
        {items.map((item) => (
          <Chip
            key={item.id}
            style={commonItemStyles.tagChip}
            onPress={() => handleChipPress(item)}
            selected={
              selectedChips &&
              selectedChips.some((selectedItem) => selectedItem.id === item.id)
            }
          >
            {item.name}
          </Chip>
        ))}
      </View>
    </View>
  );
};

export default Labels;
