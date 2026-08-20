import commonStyles from "../../src/styles/commonStyles";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Divider, RadioButton, Text, useTheme } from "react-native-paper";
import { View } from "react-native";
import React, { useState } from "react";
import DateRangePicker from "./DateRangePicker";
import { useRecoilState } from "recoil";
import { tagsState } from "../../recoil/atom";
import { BaseTransactionType, Filter, Tag, User } from "../../types";

import FilterOptionsList from "./FilterOptionsList";
import Button from "./Button";
import SecondaryButton from "./SecondaryButton";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import TertiaryButton from "./TertiaryButton";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { TouchableOpacity } from "react-native";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UI_ELEMENTS_GAP } from "../../src/styles/constants";

import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FilterScreenProps {
  user: User[];
  sender: User[];
  receiver: User[];
  type: BaseTransactionType[];
  onApply: (arg: Filter) => void;
  defaultFilter?: Filter; // Add this line to accept an optional filter prop
  onClose: () => void;
}

const FilterScreen: React.FC<FilterScreenProps> = ({
  user,
  sender,
  receiver,
  type,
  onApply,
  defaultFilter,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClose,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [range, setRange] = React.useState(
    defaultFilter && defaultFilter.fromDate && defaultFilter.toDate
      ? { startDate: defaultFilter.fromDate, endDate: defaultFilter.toDate }
      : { startDate: undefined, endDate: undefined },
  );
  const [selectedOption, setSelectedOption] = useState("custom");
  const [tags] = useRecoilState(tagsState);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    defaultFilter ? defaultFilter.tags : [],
  );

  const [selectedUsers, setSelectedUsers] = useState<User[]>(
    defaultFilter ? defaultFilter.user : [],
  );
  const [selectedSenders, setSelectedSenders] = useState<User[]>(
    defaultFilter ? defaultFilter.sender : [],
  );
  const [selectedReceivers, setSelectedReceivers] = useState<User[]>(
    defaultFilter ? defaultFilter.receiver : [],
  );
  const [selectedTypes, setSelectedTypes] = useState<BaseTransactionType[]>(
    defaultFilter ? defaultFilter.type : [],
  );

  const handleSetRange = (value) => {
    setRange(value);
    setSelectedOption("custom");
  };

  // Function to set date range for "This month" or "This year"
  const setDefaultDateRange = (option) => {
    const today = new Date();
    let startDate, endDate;

    if (option === "thisMonth") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = today;
    } else if (option === "thisYear") {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = today;
    }

    setRange({ startDate, endDate });
    setSelectedOption(option);
  };

  // Handle option change
  const handleOptionChange = (value) => {
    setSelectedOption(value);

    if (value === "thisMonth" || value === "thisYear") {
      setDefaultDateRange(value);
    }
  };

  const onFilterApply = () => {
    const filter: Filter = {
      sender: selectedSenders,
      receiver: selectedReceivers,
      user: selectedUsers,
      tags: selectedTags,
      fromDate: range.startDate,
      toDate: range.endDate,
      type: selectedTypes,
    };
    onApply(filter);
  };

  const onClearAll = () => {
    const clearedState: Filter = {
      sender: [],
      receiver: [],
      user: [],
      tags: [],
      fromDate: undefined,
      toDate: undefined,
    };
    setRange({
      startDate: clearedState.fromDate,
      endDate: clearedState.toDate,
    });
    setSelectedOption("custom");
    setSelectedTags(clearedState.tags);
    setSelectedUsers(clearedState.user);
    setSelectedSenders(clearedState.sender);
    setSelectedReceivers(clearedState.receiver);
    onApply(clearedState);
  };

  const availableTabs = ["Date Range"];
  if (tags && tags.length > 0) availableTabs.push("Tags");
  if (user && user.length > 0) availableTabs.push("Users");
  if (sender && sender.length > 0) availableTabs.push("Senders");
  if (receiver && receiver.length > 0) availableTabs.push("Receivers");
  if (type && type.length > 0) availableTabs.push("Types");

  const [activeTab, setActiveTab] = useState("Date Range");

  return (
    <View style={[commonStyles.container, { padding: 0 }]}>
      <View style={{ flexDirection: "row", flex: 1 }}>
        {/* Left Sidebar */}
        <View
          style={{
            width: "35%",
            backgroundColor: theme.colors.surfaceVariant,
            paddingTop: 16,
          }}
        >
          {availableTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor:
                  activeTab === tab ? theme.colors.surface : "transparent",
              }}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={{
                  fontWeight: activeTab === tab ? "bold" : "normal",
                  color:
                    activeTab === tab
                      ? theme.colors.primary
                      : theme.colors.onSurface,
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Right Content */}
        <View style={{ width: "65%", backgroundColor: theme.colors.surface }}>
          <BottomSheetScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          >
            {activeTab === "Date Range" && (
              <>
                <DateRangePicker range={range} setRange={handleSetRange} />
                <View style={{ marginVertical: 16 }}>
                  <RadioButton.Group
                    onValueChange={handleOptionChange}
                    value={selectedOption}
                  >
                    <RadioButton.Item label="This Month" value="thisMonth" />
                    <RadioButton.Item label="This Year" value="thisYear" />
                    <RadioButton.Item label="Custom Range" value="custom" />
                  </RadioButton.Group>
                </View>
              </>
            )}
            {activeTab === "Tags" && (
              <FilterOptionsList
                items={tags}
                setSelectedChips={setSelectedTags}
                selectedChips={selectedTags}
              />
            )}
            {activeTab === "Users" && (
              <FilterOptionsList
                items={user}
                setSelectedChips={setSelectedUsers}
                selectedChips={selectedUsers}
              />
            )}
            {activeTab === "Senders" && (
              <FilterOptionsList
                items={sender}
                setSelectedChips={setSelectedSenders}
                selectedChips={selectedSenders}
              />
            )}
            {activeTab === "Receivers" && (
              <FilterOptionsList
                items={receiver}
                setSelectedChips={setSelectedReceivers}
                selectedChips={selectedReceivers}
              />
            )}
            {activeTab === "Types" && (
              <FilterOptionsList
                items={type}
                setSelectedChips={setSelectedTypes}
                selectedChips={selectedTypes}
              />
            )}
          </BottomSheetScrollView>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16),
          paddingHorizontal: 16,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outlineVariant,
          gap: 8,
        }}
      >
        <SecondaryButton
          icon={"filter-remove"}
          style={{ flex: 1 }}
          title={"Clear All"}
          onPress={onClearAll}
          mode={"outlined"}
        />
        <Button
          icon={"filter-check"}
          style={{ flex: 1 }}
          title={"Apply"}
          onPress={onFilterApply}
        />
      </View>
    </View>
  );
};

export default FilterScreen;
