import commonItemStyles from "../../src/styles/commonItemStyles";
import { View } from "react-native";
import { Chip, Text, Searchbar, useTheme } from "react-native-paper";
import React, { Dispatch, SetStateAction, useState, useMemo } from "react";

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
  selectedChips = [],
}) => {
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const theme = useTheme();

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [items, searchQuery]);

  const displayItems = useMemo(() => {
    if (expanded || filteredItems.length <= 6) return filteredItems;

    // Always show selected items first
    const selected = filteredItems.filter((item) =>
      selectedChips?.some((sc) => sc.id === item.id),
    );
    const unselected = filteredItems.filter(
      (item) => !selectedChips?.some((sc) => sc.id === item.id),
    );

    const toShow = [...selected];
    let i = 0;
    while (toShow.length < 5 && i < unselected.length) {
      toShow.push(unselected[i]);
      i++;
    }
    return toShow;
  }, [filteredItems, selectedChips, expanded]);

  const handleChipPress = (item: Item) => {
    if (setSelectedChips) {
      let updatedSelectedChips;

      if (selectedChips.some((selectedItem) => selectedItem.id === item.id)) {
        updatedSelectedChips = selectedChips.filter(
          (selectedItem) => selectedItem.id !== item.id,
        );
      } else {
        updatedSelectedChips = [...selectedChips, item];
      }

      setSelectedChips(updatedSelectedChips);
    }
  };

  return (
    <View
      style={[
        commonItemStyles.tagsContainer,
        { flexDirection: "column", alignItems: "flex-start", width: "100%" },
      ]}
    >
      <View style={{ marginBottom: 8 }}>
        {label && (
          <Text variant="titleSmall" style={{ fontWeight: "600" }}>
            {label}:{" "}
          </Text>
        )}
      </View>
      {expanded && items.length > 6 && (
        <Searchbar
          placeholder={`Search ${label}...`}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            height: 40,
            marginBottom: 12,
            backgroundColor: theme.colors.surfaceVariant,
            elevation: 0,
            width: "100%",
          }}
          inputStyle={{ minHeight: 40, paddingBottom: 0 }}
        />
      )}
      <View style={[commonItemStyles.tagChipsContainer, { width: "100%" }]}>
        {displayItems.map((item) => (
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
        {!expanded && filteredItems.length > displayItems.length && (
          <Chip
            style={[
              commonItemStyles.tagChip,
              { backgroundColor: "transparent", borderWidth: 1 },
            ]}
            onPress={() => setExpanded(true)}
            icon="chevron-down"
          >
            +{filteredItems.length - displayItems.length} more
          </Chip>
        )}
        {expanded && (
          <Chip
            style={[
              commonItemStyles.tagChip,
              { backgroundColor: "transparent", borderWidth: 1 },
            ]}
            onPress={() => {
              setExpanded(false);
              setSearchQuery("");
            }}
            icon="chevron-up"
          >
            Show less
          </Chip>
        )}
      </View>
    </View>
  );
};

export default Labels;
