import React from "react";
import {IconButton, Searchbar, Switch, useTheme} from "react-native-paper";
import {StyleSheet, Text, View} from "react-native";
import commonStyles from "./commonStyles";

interface SearchFilterProps {
    handleSearch: (query: string) => void,
    searchQuery: string,
    openBottomSheet: () => void
}

const SearchFilter: React.FC<SearchFilterProps> = ({ handleSearch, searchQuery, openBottomSheet }) => {

    return (
        <View style={commonStyles.row}>
            <Searchbar
                placeholder="Search"
                onChangeText={handleSearch}
                value={searchQuery}
                style={styles.searchBar}
            />
            <IconButton icon="filter" mode={'contained'} onPress={openBottomSheet} />
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        maxHeight: '80%', // Limit the height to 80% of the screen height
    },
    searchBar: {
        width: '80%'
    }
});

export default SearchFilter;
