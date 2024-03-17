import { BottomSheetModal } from "@gorhom/bottom-sheet";
import customBackDrop from "../CustomBackDrop";
import FilterScreen from "./FilterScreen";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Filter, User } from "../../types";
import { BackHandler, StyleSheet, View } from "react-native";
import commonStyles from "../../src/styles/commonStyles";
import { IconButton, Searchbar, useTheme } from "react-native-paper";
import { DROPDOWN_HEIGHT, UI_ELEMENTS_GAP } from "../../src/styles/constants";

interface SearchAndFilterProps {
  handleSearch: (query: string) => void;
  searchQuery: string;
  user?: User[];
  sender?: User[];
  receiver?: User[];
  onApply: (arg: Filter) => void;
  searchBar?: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  handleSearch,
  searchQuery,
  user,
  sender,
  receiver,
  onApply,
  searchBar = true,
}) => {
  const theme = useTheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "80%"], []);
  const [currentFilter, setCurrentFilter] = useState<Filter | null>(null); // Use a state variable

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

  const onApplyFilter = (arg: Filter) => {
    setCurrentFilter(arg); // Update the state variable
    bottomSheetModalRef.current.close();
    onApply(arg);
  };

  return (
    <View style={commonStyles.row}>
      {searchBar && (
        <Searchbar
          placeholder="Search"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={{ minHeight: DROPDOWN_HEIGHT }}
        />
      )}
      <IconButton icon="filter" mode={"contained"} onPress={openBottomSheet} />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
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
    width: "80%",
    marginBottom: UI_ELEMENTS_GAP,
  },
});

export default SearchAndFilter;
