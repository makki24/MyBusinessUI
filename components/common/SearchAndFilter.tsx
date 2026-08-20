import { BottomSheetModal } from "@gorhom/bottom-sheet";
import customBackDrop from "../CustomBackDrop";
import FilterScreen from "./FilterScreen";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BaseTransactionType,
  Filter,
  Sort,
  SortableProperties,
  User,
} from "../../types";
import { BackHandler, StyleSheet, View, ScrollView } from "react-native";
import commonStyles from "../../src/styles/commonStyles";
import {
  IconButton,
  Menu,
  Searchbar,
  useTheme,
  Chip,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Text,
} from "react-native-paper";
import { DROPDOWN_HEIGHT, UI_ELEMENTS_GAP } from "../../src/styles/constants";

interface SearchAndFilterProps {
  handleSearch: (query: string) => void;
  user?: User[];
  sender?: User[];
  receiver?: User[];
  type?: BaseTransactionType[];
  onApply: (arg: Filter) => void;
  searchBar?: boolean;
  defaultFilter?: Filter;
  appliedSort?: Sort[];
  sort?: boolean;
  setSort?: React.Dispatch<React.SetStateAction<Sort[]>>;
  filter?: boolean;
}

type Icons = {
  [key in SortableProperties]?: string;
};

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  handleSearch,
  user,
  sender,
  receiver,
  type,
  onApply,
  searchBar = true,
  defaultFilter = null,
  appliedSort = null,
  sort = false,
  setSort,
  filter = true,
}) => {
  const theme = useTheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);
  const [currentFilter, setCurrentFilter] = useState<Filter | null>(
    defaultFilter,
  ); // Use a state variable
  const [visible, setVisible] = React.useState(false);
  const [cleared, setIsCleared] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const onHandleSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  useEffect(() => {
    setCurrentFilter(defaultFilter);
  }, [defaultFilter]);

  // Properly manage BackHandler: only active while sheet is open
  useEffect(() => {
    if (!isSheetOpen) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        bottomSheetModalRef.current?.dismiss();
        return true;
      },
    );

    return () => backHandler.remove();
  }, [isSheetOpen]);

  const handleSheetChange = useCallback((index: number) => {
    // index === -1 means the sheet is fully closed
    setIsSheetOpen(index >= 0);
  }, []);

  const openBottomSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const compareDeep = (f) => {
    return (
      f.sender.length === 0 &&
      f.receiver.length === 0 &&
      f.user.length === 0 &&
      f.tags.length === 0 &&
      !f.fromDate &&
      !f.toDate
    );
  };

  const onApplyFilter = (arg: Filter) => {
    setCurrentFilter(arg); // Update the state variable

    setIsCleared(compareDeep(arg));

    bottomSheetModalRef.current.dismiss();
    onApply(arg);
  };

  const [icons, setIcons] = useState<Icons>({});

  useEffect(() => {
    if (sort) updateIcons(appliedSort);
  }, []);

  const updateIcons = (sorts: Sort[]) => {
    const newIcons = {};
    for (const sortItem of sorts) {
      newIcons[sortItem.property] =
        sortItem.direction === "asc" ? "arrow-up" : "arrow-down";
    }
    setIcons(newIcons);
  };

  const applySort = (property: SortableProperties) => {
    setSort((prevSorts) => {
      const newSorts = [...prevSorts];
      const sortIndex = newSorts.findIndex(
        (newSort) => newSort.property === property,
      );
      if (sortIndex === -1) {
        newSorts.push({ property, direction: "asc" });
      } else if (newSorts[sortIndex].direction === "asc") {
        newSorts[sortIndex].direction = "desc";
      } else {
        newSorts.splice(sortIndex, 1);
      }
      updateIcons(newSorts);
      return newSorts;
    });
  };

  const renderActiveFilters = () => {
    if (!currentFilter) return null;
    const chips = [];

    if (currentFilter.type && currentFilter.type.length > 0) {
      chips.push(
        <Chip
          key="type"
          style={styles.chip}
          onClose={() => {
            const newFilter = { ...currentFilter, type: [] };
            onApplyFilter(newFilter);
          }}
        >
          Type: {currentFilter.type.length}
        </Chip>,
      );
    }

    if (currentFilter.sender && currentFilter.sender.length > 0) {
      chips.push(
        <Chip
          key="sender"
          style={styles.chip}
          onClose={() => {
            const newFilter = { ...currentFilter, sender: [] };
            onApplyFilter(newFilter);
          }}
        >
          Sender: {currentFilter.sender.length}
        </Chip>,
      );
    }

    if (currentFilter.receiver && currentFilter.receiver.length > 0) {
      chips.push(
        <Chip
          key="receiver"
          style={styles.chip}
          onClose={() => {
            const newFilter = { ...currentFilter, receiver: [] };
            onApplyFilter(newFilter);
          }}
        >
          Receiver: {currentFilter.receiver.length}
        </Chip>,
      );
    }

    if (currentFilter.user && currentFilter.user.length > 0) {
      chips.push(
        <Chip
          key="user"
          style={styles.chip}
          onClose={() => {
            const newFilter = { ...currentFilter, user: [] };
            onApplyFilter(newFilter);
          }}
        >
          User: {currentFilter.user.length}
        </Chip>,
      );
    }

    if (currentFilter.tags && currentFilter.tags.length > 0) {
      chips.push(
        <Chip
          key="tags"
          style={styles.chip}
          onClose={() => {
            const newFilter = { ...currentFilter, tags: [] };
            onApplyFilter(newFilter);
          }}
        >
          Tags: {currentFilter.tags.length}
        </Chip>,
      );
    }

    if (chips.length === 0) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {chips}
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, marginBottom: UI_ELEMENTS_GAP }}>
      <View style={commonStyles.row}>
        {searchBar && (
          <Searchbar
            placeholder="Search"
            onChangeText={onHandleSearch}
            value={searchQuery}
            style={[
              styles.searchBar,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            inputStyle={{ minHeight: DROPDOWN_HEIGHT }}
          />
        )}
        <View style={commonStyles.simpleRow}>
          {filter && (
            <IconButton
              icon={cleared ? "filter" : "filter-check"}
              mode={"contained"}
              onPress={openBottomSheet}
            />
          )}

          {sort && (
            <View>
              <Menu
                visible={visible}
                onDismiss={() => setVisible(false)}
                anchor={
                  <IconButton
                    icon="sort"
                    mode={"contained"}
                    onPress={() => setVisible(true)}
                  />
                }
              >
                {sender && (
                  <Menu.Item
                    leadingIcon={"send"}
                    onPress={() => {
                      applySort("sender");
                    }}
                    title="Sender"
                    trailingIcon={icons["sender"]}
                  />
                )}
                {receiver && (
                  <Menu.Item
                    leadingIcon={"account-check"}
                    onPress={() => {
                      applySort("receiver");
                    }}
                    title="Receiver"
                    trailingIcon={icons["receiver"]}
                  />
                )}
                {user && (
                  <Menu.Item
                    leadingIcon={"account"}
                    onPress={() => {
                      applySort("user.name");
                    }}
                    title="User"
                    trailingIcon={icons["user.name"]}
                  />
                )}
                <Menu.Item
                  leadingIcon={"clock-time-eight"}
                  onPress={() => {
                    applySort("date");
                  }}
                  title="Date"
                  trailingIcon={icons["date"]}
                />
                <Menu.Item
                  leadingIcon={"cash"}
                  onPress={() => {
                    applySort("amount");
                  }}
                  title="Amount"
                  trailingIcon={icons["amount"]}
                />
                <Menu.Item
                  leadingIcon={"ab-testing"}
                  onPress={() => {
                    applySort("type.name");
                  }}
                  title="Type"
                  trailingIcon={icons["type.name"]}
                />
              </Menu>
            </View>
          )}
        </View>
      </View>
      {renderActiveFilters()}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={customBackDrop}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        enablePanDownToClose={true}
        enableDismissOnClose={true}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
      >
        <FilterScreen
          user={user}
          sender={sender}
          receiver={receiver}
          type={type}
          onApply={onApplyFilter}
          defaultFilter={currentFilter}
          onClose={() => bottomSheetModalRef.current.dismiss()}
        />
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flex: 1,
    marginRight: 8,
    borderRadius: 24,
  },
  chipContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    borderRadius: 16,
  },
});

export default SearchAndFilter;
