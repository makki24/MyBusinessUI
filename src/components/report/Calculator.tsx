import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { DataTable, TextInput, useTheme, Tooltip } from "react-native-paper";
import reportService from "../../../services/ReportService";
import commonStyles from "../../styles/commonStyles";
import Button from "../../../components/common/Button";
import LoadingError from "../../../components/common/LoadingError";

interface RenderTooltipProps {
  label: string;
  ellipse: boolean;
}

interface CalculatorProps {
  route: {
    params: {
      tagId: number;
      excludeTagId: number;
    };
  };
}

const Calculator: React.FC<CalculatorProps> = ({ route }) => {
  const [groupedData, setGroupedData] = useState({});
  const [totalOfAll, setTotalOfAll] = useState(0);
  const [profit, setProfit] = useState(0);
  const [editingGroup, setEditingGroup] = useState({});
  const [editingSubGroup, setEditingSubGroup] = useState({});
  const [updatedTotalOfAll, setUpdatedTotalOfAll] = useState(0);
  const [tagId] = useState(route.params.tagId); // Example tagId
  const [excludeTagId] = useState(route.params.excludeTagId); // Example excludeTagId
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const theme = useTheme();

  useEffect(() => {
    fetchGroupedData();
  }, [tagId, excludeTagId]);

  const roundUp = (amount) => {
    return Math.round(amount * 100) / 100;
  };

  const fetchGroupedData = async () => {
    setIsLoading(true);
    try {
      const response = await reportService.getGroupedReport(
        tagId,
        excludeTagId,
      );

      // Calculate total amount for each group
      const groupTotals = {};
      Object.keys(response.groupedData).forEach((key) => {
        const totalAmount = response.groupedData[key].reduce(
          (sum, user) => sum + user.totalAmount,
          0,
        );
        groupTotals[key] = totalAmount;
      });

      // Sort groups by total amount
      const sortedGroupedData = Object.keys(response.groupedData)
        .sort((a, b) => groupTotals[b] - groupTotals[a])
        .reduce((obj, key) => {
          obj[key] = response.groupedData[key];
          return obj;
        }, {});

      setGroupedData(sortedGroupedData);
      setTotalOfAll(roundUp(response.totalOfAll));
      setUpdatedTotalOfAll(roundUp(response.totalOfAll));
      setProfit(roundUp(response.profit));

      // Initialize all groups as collapsed
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
        const newTotalAmount =
          (user.totalAmount / parseFloat(pricePerUnit)) * newSubPrice;
        user.updatedTotalAmount = roundUp(newTotalAmount);
        newTotal += newTotalAmount;
      });
    });

    setUpdatedTotalOfAll((prev) => {
      setProfit(roundUp(profit - newTotal + prev));
      return roundUp(newTotal);
    });
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
              {""}
            </DataTable.Cell>
            <DataTable.Cell style={styles.largeColumn} numeric>
              <TextInput
                mode="outlined"
                keyboardType="numeric"
                value={
                  editingGroup[key]
                    ? editingGroup[key].toString()
                    : pricePerUnit.toString()
                }
                onChangeText={(text) =>
                  setEditingGroup({ ...editingGroup, [key]: text })
                }
                style={styles.input}
              />
            </DataTable.Cell>
          </DataTable.Row>
        </TouchableOpacity>
        {!collapsedGroups[key] &&
          groupedData[key].map((user) => (
            <DataTable.Row key={user.userId}>
              <DataTable.Cell style={styles.largeColumn}>{""}</DataTable.Cell>
              <DataTable.Cell style={styles.mediumColumn}>
                <RenderTooltip label={user.userName} ellipse={false} />
              </DataTable.Cell>
              <DataTable.Cell style={styles.largeColumn} numeric>
                <RenderTooltip
                  label={
                    user.updatedTotalAmount !== undefined
                      ? user.updatedTotalAmount
                      : user.totalAmount
                  }
                  ellipse={true}
                />
              </DataTable.Cell>
              <DataTable.Cell style={styles.largeColumn} numeric>
                <TextInput
                  mode="outlined"
                  keyboardType="numeric"
                  value={
                    editingSubGroup[key] && editingSubGroup[key][user.userId]
                      ? editingSubGroup[key][user.userId].toString()
                      : pricePerUnit.toString()
                  }
                  onChangeText={(text) =>
                    setEditingSubGroup({
                      ...editingSubGroup,
                      [key]: {
                        ...editingSubGroup[key],
                        [user.userId]: text,
                      },
                    })
                  }
                  style={styles.input}
                />
              </DataTable.Cell>
            </DataTable.Row>
          ))}
      </View>
    );
  };

  const sortedKeys = useMemo(() => Object.keys(groupedData), [groupedData]);

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />
      <View style={{ ...commonStyles.row, alignItems: "center" }}>
        <View>
          <Text>T Amount of Works: {totalOfAll}</Text>
          <Text>After Edit: {updatedTotalOfAll}</Text>
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
    width: 80, // Fixed width for the input fields
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
