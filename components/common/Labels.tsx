import commonItemStyles from "./commonItemStyles";
import {View} from "react-native";
import {Chip, Text} from "react-native-paper";
import React, {useState} from "react";


interface Item {
    id?: string | number;
    name: string;
}

interface LabelListProps<T extends Item> {
    items: T[];
    label: string;
    onChipPress?: (items: T[]) => void;
}
const Labels: React.FC<LabelListProps<Item>> = ({items,label, onChipPress}) => {
    const [selectedChips, setSelectedChips] = useState<Item[]>([]);

    const handleChipPress = (item: Item) => {
        let updatedSelectedChips;

        if (selectedChips.some((selectedItem) => selectedItem.id === item.id)) {
            // If item is already selected, remove it
            updatedSelectedChips = selectedChips.filter((selectedItem) => selectedItem.id !== item.id);
        } else {
            // If item is not selected, add it
            updatedSelectedChips = [...selectedChips, item];
        }

        setSelectedChips(updatedSelectedChips);

        // Pass back the selected chips to the parent component
        if (onChipPress) {
            onChipPress(updatedSelectedChips);
        }
    };

    return (
        <View style={commonItemStyles.tagsContainer}>
            <Text variant="titleMedium">{label}: </Text>
            <View style={commonItemStyles.tagChipsContainer}>
                {items.map((item) => (
                    <Chip
                        key={item.id}
                        style={commonItemStyles.tagChip}
                        onPress={() => handleChipPress(item)}
                        selected={selectedChips.some((selectedItem) => selectedItem.id === item.id)}
                    >
                        {item.name}
                    </Chip>
                ))}
            </View>
        </View>
    );
}

export default Labels;