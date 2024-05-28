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
import { Filter, Sort, SortableProperties, User } from "../../types";
import { BackHandler, StyleSheet, View } from "react-native";
import commonStyles from "../../src/styles/commonStyles";
import { IconButton, Menu, Searchbar, useTheme } from "react-native-paper";
import { DROPDOWN_HEIGHT, UI_ELEMENTS_GAP } from "../../src/styles/constants";

interface SearchAndFilterProps {
  handleSearch: (query: string) => void;
  user?: User[];
  sender?: User[];
  receiver?: User[];
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
  const snapPoints = useMemo(() => ["25%", "50%", "80%"], []);
  const [currentFilter, setCurrentFilter] = useState<Filter | null>(
    defaultFilter,
  ); // Use a state variable
  const [visible, setVisible] = React.useState(false);
  const [cleared, setIsCleared] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const onHandleSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const openBottomSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();

    const backAction = () => {
      bottomSheetModalRef.current.close();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
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

    bottomSheetModalRef.current.close();
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

  return (
    <View style={commonStyles.row}>
      {searchBar && (
        <Searchbar
          placeholder="Search"
          onChangeText={onHandleSearch}
          value={searchQuery}
          style={styles.searchBar}
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
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={2}
        snapPoints={snapPoints}
        backdropComponent={customBackDrop}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
      >
        <FilterScreen
          user={user}
          sender={sender}
          receiver={receiver}
          onApply={onApplyFilter}
          defaultFilter={currentFilter}
          onClose={() => bottomSheetModalRef.current.close()}
        />
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flex: 1,
    marginBottom: UI_ELEMENTS_GAP,
  },
});

export default SearchAndFilter;
