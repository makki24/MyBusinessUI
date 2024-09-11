import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { DataTable, useTheme, Tooltip, Text } from "react-native-paper";
import reportService from "../../../services/ReportService";
import commonStyles from "../../styles/commonStyles";
import Button from "../../../components/common/Button";
import LoadingError from "../../../components/common/LoadingError";
import { Filter } from "../../../types";
import NumericInput from "./NumericInput";
import {
  CollapsedGroups,
  GroupedData,
  GroupTotals,
  PricePerUnitAndTypeGroupedData,
} from "./types";

interface RenderTooltipProps {
  label: string;
  ellipse: boolean;
}

interface CalculatorProps {
  route: {
    params: {
      tagId: number;
      excludeTagId: number;
      range: {
        startDate: string;
        endDate: string;
      };
    };
  };
}

const Calculator: React.FC<CalculatorProps> = ({ route }) => {
  const [groupedData, setGroupedData] = useState<GroupedData>({});
  const [totalOfAll, setTotalOfAll] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [editingGroup, setEditingGroup] = useState({});
  const [editingSubGroup, setEditingSubGroup] = useState({});
  const [updatedTotalOfAll, setUpdatedTotalOfAll] = useState<number>(0);
  const [groupSums, setGroupSums] = useState<{ [key: string]: number }>({});
  const [tagId] = useState(route.params.tagId);
  const [excludeTagId] = useState(route.params.excludeTagId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<CollapsedGroups>({});

  const theme = useTheme();

  useEffect(() => {
    fetchGroupedData();
  }, [tagId, excludeTagId]);

  const roundUp = (amount) => {
    return Math.round(amount * 100) / 100;
  };

  const createFilter = () => {
    return {
      tags: [{ id: tagId }],
      excludeTags: excludeTagId ? [{ id: excludeTagId }] : [],
      fromDate: new Date(route.params.range.startDate),
      toDate: new Date(route.params.range.endDate),
    } as Filter;
  };

  const fetchGroupedData = async () => {
    setIsLoading(true);
    try {
      const filter: Filter = createFilter();
      const response: PricePerUnitAndTypeGroupedData =
        await reportService.getGroupedReport(filter);

      const groupTotals: GroupTotals = {};
      const fetchedGroupSums: { [key: string]: number } = {};

      Object.keys(response.groupedData).forEach((key) => {
        const totalAmount = response.groupedData[key].reduce((sum, user) => {
          const multiplier = user.userWorkTypePricePerUnit
            ? user.userWorkTypePricePerUnit / 10
            : 1;
          const adjustedAmount = user.totalAmount * multiplier;
          return sum + adjustedAmount;
        }, 0);

        groupTotals[key] = totalAmount;
        fetchedGroupSums[key] = totalAmount; // Store initial sum

        response.groupedData[key].forEach((user) => {
          const multiplier = user.userWorkTypePricePerUnit
            ? user.userWorkTypePricePerUnit / 10
            : 1;
          user.updatedTotalAmount = user.totalAmount * multiplier;
        });
      });

      const sortedGroupedData = Object.keys(response.groupedData)
        .sort((a, b) => groupTotals[b] - groupTotals[a])
        .reduce((obj, key) => {
          obj[key] = response.groupedData[key];
          return obj;
        }, {});

      setGroupedData(sortedGroupedData);
      setGroupSums(fetchedGroupSums);

      const total = Object.values(groupTotals).reduce(
        (sum, amount) => sum + amount,
        0,
      );
      setTotalOfAll(roundUp(total));
      setUpdatedTotalOfAll(roundUp(total));
      setProfit(roundUp(response.profit + response.totalOfAll - total));

      const initialCollapsedGroups = {};
      Object.keys(sortedGroupedData).forEach((key) => {
        initialCollapsedGroups[key] = true;
      });
      setCollapsedGroups(initialCollapsedGroups);
    } catch (fetchError) {
      setError(fetchError.message ?? "Error fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = () => {
    let newTotal = 0;
    const newGroupSums = { ...groupSums };

    Object.keys(groupedData).forEach((key) => {
      const [pricePerUnit] = key.split("|");
      const groupPrice = editingGroup[key]
        ? parseFloat(editingGroup[key])
        : parseFloat(pricePerUnit);

      groupedData[key].forEach((user) => {
        const newSubPrice =
          editingSubGroup[key] && editingSubGroup[key][user.userId]
            ? parseFloat(editingSubGroup[key][user.userId])
            : groupPrice;

        const newMultiplier =
          editingSubGroup[key] &&
          editingSubGroup[key][`${user.userId}_multiplier`]
            ? parseFloat(editingSubGroup[key][`${user.userId}_multiplier`]) / 10
            : user.userWorkTypePricePerUnit
              ? user.userWorkTypePricePerUnit / 10
              : 1;

        const newTotalAmount =
          (user.totalAmount / parseFloat(pricePerUnit)) *
          newSubPrice *
          newMultiplier;

        user.updatedTotalAmount = roundUp(newTotalAmount);
        newTotal += newTotalAmount;
      });

      // Update sum for the group
      newGroupSums[key] = groupedData[key].reduce(
        (sum, user) => sum + user.updatedTotalAmount,
        0,
      );
    });

    setUpdatedTotalOfAll((prev) => {
      setProfit(roundUp(profit - newTotal + prev));
      return roundUp(newTotal);
    });

    // Update group sums state
    setGroupSums(newGroupSums);
  };

  const RenderTooltip: React.FC<RenderTooltipProps> = ({ label, ellipse }) => {
    return (
      <Tooltip title={label}>
        <View>
          {ellipse && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.ellipsisText}
            >
              {label}
            </Text>
          )}
          {!ellipse && <Text>{label}</Text>}
        </View>
      </Tooltip>
    );
  };

  const toggleCollapse = useCallback((key) => {
    setCollapsedGroups((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  }, []);

  const renderItem = ({ item: key }) => {
    const [pricePerUnit, typeName] = key.split("|");
    return (
      <View key={key}>
        <TouchableOpacity onPress={() => toggleCollapse(key)}>
          <DataTable.Row>
            <DataTable.Cell style={styles.largeColumn}>
              <RenderTooltip
                label={`${pricePerUnit} | ${typeName}`}
                ellipse={false}
              />
            </DataTable.Cell>
            <DataTable.Cell style={styles.mediumColumn} numeric>
              {""}
            </DataTable.Cell>
            <DataTable.Cell style={styles.largeColumn} numeric>
              <Text>{roundUp(groupSums[key])}</Text> {/* Display group sum */}
            </DataTable.Cell>
            <DataTable.Cell style={styles.largeColumn} numeric>
              <NumericInput
                initialValue={
                  editingGroup[key]
                    ? editingGroup[key].toString()
                    : pricePerUnit.toString()
                }
                onChange={(text) =>
                  setEditingGroup({ ...editingGroup, [key]: text })
                }
              />
            </DataTable.Cell>
          </DataTable.Row>
        </TouchableOpacity>
        {!collapsedGroups[key] &&
          groupedData[key].map((user) => (
            <DataTable.Row key={user.userId}>
              {user.userWorkTypePricePerUnit !== null && (
                <>
                  <DataTable.Cell style={styles.largeColumn}>
                    <NumericInput
                      initialValue={
                        editingSubGroup[key] &&
                        editingSubGroup[key][`${user.userId}_multiplier`]
                          ? editingSubGroup[key][
                              `${user.userId}_multiplier`
                            ].toString()
                          : user.userWorkTypePricePerUnit
                            ? user.userWorkTypePricePerUnit.toString()
                            : ""
                      }
                      onChange={(text) =>
                        setEditingSubGroup({
                          ...editingSubGroup,
                          [key]: {
                            ...editingSubGroup[key],
                            [`${user.userId}_multiplier`]: text,
                          },
                        })
                      }
                    />
                  </DataTable.Cell>
                </>
              )}
              {user.userWorkTypePricePerUnit === null && (
                <>
                  <DataTable.Cell style={styles.largeColumn}>
                    {""}
                  </DataTable.Cell>
                </>
              )}
              <DataTable.Cell style={styles.mediumColumn}>
                <RenderTooltip label={user.userName} ellipse={false} />
              </DataTable.Cell>
              <DataTable.Cell style={styles.largeColumn} numeric>
                <Text>{user.updatedTotalAmount.toFixed(2)}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.largeColumn} numeric>
                <NumericInput
                  initialValue={
                    editingSubGroup[key] && editingSubGroup[key][user.userId]
                      ? editingSubGroup[key][user.userId].toString()
                      : pricePerUnit.toString()
                  }
                  onChange={(text) =>
                    setEditingSubGroup({
                      ...editingSubGroup,
                      [key]: {
                        ...editingSubGroup[key],
                        [user.userId]: text,
                      },
                    })
                  }
                />
              </DataTable.Cell>
            </DataTable.Row>
          ))}
      </View>
    );
  };

  const sortedKeys = useMemo(() => Object.keys(groupedData), [groupedData]);

  return (
    <View style={[commonStyles.container, styles.container]}>
      <LoadingError error={error} isLoading={isLoading} />
      <View style={{ ...commonStyles.row, alignItems: "center" }}>
        <View>
          <Text>T Amount of Works: {totalOfAll}</Text>
          <Text>After edit, amt of Works: {updatedTotalOfAll}</Text>
          <Text>
            Profit:{" "}
            <Text
              style={
                profit > 0
                  ? { color: theme.colors.primary }
                  : { color: theme.colors.error }
              }
            >
              {profit}
            </Text>
          </Text>
        </View>
        <Button
          icon={"plus"}
          onPress={() => handleUpdate()}
          mode="contained"
          title={"Update"}
        />
      </View>
      <FlatList
        data={sortedKeys}
        renderItem={renderItem}
        keyExtractor={(key) => key}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    width: 80,
    fontSize: 12,
  },
  largeColumn: {
    flex: 3,
  },
  mediumColumn: {
    flex: 2,
  },
  ellipsisText: {
    flex: 1,
  },
});

export default Calculator;
