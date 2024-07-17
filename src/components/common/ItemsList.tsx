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

interface HasDate {
  date: string | Date;
  id?: number; // Assuming that each item has an id property for key extraction
}

interface ItemsListProps<T extends HasDate> {
  uniQueFilterValues: Filter;
  searchBar: boolean;
  sort: boolean;
  handleSearch: () => void;
  fetchData: (filter: FilterAndSort) => Promise<T[]>;
  renderItem: ListRenderItem<T> | null | undefined;
  onAdd: () => void;
  recoilState: RecoilState<T[]>;
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
  };

  const [items, setItems] = useRecoilState<T[]>(recoilState);
  const [error, setError] = useState<string | null>(null);
  const [defaultFilter, setDefaultFilter] = useState<Filter>(initialFilter);
  const [defaultSort, setDefaultSort] = useState<Sort[]>([
    { property: "date", direction: "desc" },
  ]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const transformAndSetData = (itemsData: T[]) => {
    const transformedData = itemsData.map((expense: T) => ({
      ...expense,
      date: new Date(expense.date),
    }));
    setItems(transformedData);
  };

  useEffect(() => {
    onApply(defaultFilter);
  }, [defaultSort]);

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
          handleSearch={handleSearch}
          sender={uniQueFilterValues.sender}
          receiver={uniQueFilterValues.receiver}
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
        data={items}
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
