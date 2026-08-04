import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import {
  FAB,
  IconButton,
  Tooltip,
  ActivityIndicator,
} from "react-native-paper";
import commonStyles from "../../styles/commonStyles";
import commonScreenStyles from "../../styles/commonScreenStyles";
import SearchAndFilter from "../../../components/common/SearchAndFilter";
import LoadingError from "../../../components/common/LoadingError";
import { Filter, FilterAndSort, Sort } from "../../../types";
import type { ListRenderItem } from "react-native";
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
}: ItemsListProps<T>): React.ReactElement => {
  const initialFilter: Filter = {
    fromDate: undefined,
    toDate: undefined,
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
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const PAGE_SIZE = 15;

  const transformAndSetData = (itemsData: T[], append: boolean = false) => {
    const transformed = transFormData(itemsData);
    if (append) {
      setItems((prev) => {
        const newItems = transformed.filter(
          (newItem) => !prev.some((prevItem) => prevItem.id === newItem.id),
        );
        return [...prev, ...newItems];
      });
    } else {
      setItems(transformed);
    }
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
      const filteredData = await fetchData({
        filter: arg,
        sort: defaultSort,
        offset: 0,
        limit: PAGE_SIZE,
      });
      setHasMore(filteredData.length >= PAGE_SIZE);
      transformAndSetData(filteredData, false);
    } catch (e) {
      setError(e.message || "Error setting filters.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    onApply(defaultFilter);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || isRefreshing) return;
    setLoadingMore(true);
    try {
      const filteredData = await fetchData({
        filter: defaultFilter,
        sort: defaultSort,
        offset: items.length,
        limit: PAGE_SIZE,
      });
      setHasMore(filteredData.length >= PAGE_SIZE);
      transformAndSetData(filteredData, true);
    } catch (e) {
      setError(e.message || "Error loading more items.");
    } finally {
      setLoadingMore(false);
    }
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
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ padding: 16, alignItems: "center" }}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
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
