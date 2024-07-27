import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { FAB, IconButton, Tooltip } from "react-native-paper";
import commonStyles from "../../styles/commonStyles";
import commonScreenStyles from "../../styles/commonScreenStyles";
import SearchAndFilter from "../../../components/common/SearchAndFilter";
import LoadingError from "../../../components/common/LoadingError";
import { Filter, FilterAndSort, Sort } from "../../../types";
import type { ListRenderItem } from "@react-native/virtualized-lists";
import { RecoilState, useRecoilState } from "recoil";
import { DEFAULT_SORT } from "../../constants/filter";

interface HasDate {
  id?: number; // Assuming that each item has an id property for key extraction
}

interface ItemsListProps<T extends HasDate> {
  uniQueFilterValues: Filter;
  searchBar: boolean;
  sort: boolean;
  handleSearch: (arg: string) => T[];
  fetchData: (filter: FilterAndSort) => Promise<T[]>;
  renderItem: ListRenderItem<T> | null | undefined;
  onAdd: () => void;
  recoilState: RecoilState<T[]>;
  transFormData: (arg: T[]) => T[];
}

const ItemsList = <T extends HasDate>({
  uniQueFilterValues,
  handleSearch,
  fetchData,
  renderItem,
  onAdd,
  sort,
  searchBar,
  recoilState,
  transFormData,
}: ItemsListProps<T>): JSX.Element => {
  const fromDate = new Date();
  const toDate = new Date();
  const initialFilter: Filter = {
    fromDate: new Date(fromDate.setDate(fromDate.getDate() - 7)),
    toDate: new Date(toDate.setDate(toDate.getDate() + 1)),
    sender: [],
    receiver: [],
    tags: [],
    user: [],
    type: [],
  };

  const [items, setItems] = useRecoilState<T[]>(recoilState);
  const [error, setError] = useState<string | null>(null);
  const [defaultFilter, setDefaultFilter] = useState<Filter>(initialFilter);
  const [defaultSort, setDefaultSort] = useState<Sort[]>(DEFAULT_SORT);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filteredItems, setFilteredItems] = useState([]);

  const transformAndSetData = (itemsData: T[]) => {
    setItems(transFormData(itemsData));
  };

  useEffect(() => {
    onApply(defaultFilter);
  }, [defaultSort]);

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const onApply = async (arg: Filter) => {
    setError(null);
    setDefaultFilter(arg);
    setIsRefreshing(true);
    try {
      const filteredData = await fetchData({ filter: arg, sort: defaultSort });
      transformAndSetData(filteredData);
    } catch (e) {
      setError(e.message || "Error setting filters.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    onApply(defaultFilter);
  };

  return (
    <>
      <View style={commonStyles.simpleRow}>
        <SearchAndFilter
          searchBar={searchBar}
          sort={sort}
          handleSearch={(query) => {
            setFilteredItems(handleSearch(query));
          }}
          sender={uniQueFilterValues.sender}
          receiver={uniQueFilterValues.receiver}
          user={uniQueFilterValues.user}
          type={uniQueFilterValues.type}
          onApply={onApply}
          defaultFilter={defaultFilter}
          appliedSort={defaultSort}
          setSort={setDefaultSort}
        />
        <Tooltip title="Restore to Default">
          <IconButton
            icon="lock-reset"
            mode="contained"
            onPress={() => onApply(initialFilter)}
          />
        </Tooltip>
      </View>
      <LoadingError error={error} isLoading={isRefreshing} />

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
      <FAB
        style={commonScreenStyles.fab}
        icon="plus"
        testID="addItem"
        onPress={onAdd}
      />
    </>
  );
};

export default ItemsList;
