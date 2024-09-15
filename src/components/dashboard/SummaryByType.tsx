import React, { useEffect, useRef, useState } from "react";
import CustomDateRange from "../common/CustomDateRange";
import { Button, List, Text } from "react-native-paper";
import { ScrollView, View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import LoadingError from "../../../components/common/LoadingError";
import { TransactionSummaryByType } from "./types";
import { Filter, Tag } from "../../../types";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import commonAddScreenStyles from "../../styles/commonAddScreenStyles";
import TagsSelectorButton from "../common/TagsSelectorButton";
import { makeEventNotifier } from "../common/useEventListner";
import { roundUp } from "../../util/Calculation";

interface SummaryByTypeProps {
  api: (arg1: Filter) => Promise<TransactionSummaryByType[]>;
}

interface TransactionItemProps {
  label: string;
  amount: string;
  index: string;
}

const SummaryByType: React.FC<SummaryByTypeProps> = ({ api }) => {
  const [result, setResult] = useState([]);
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const rangeState = React.useState({
    startDate: thisMonth,
    endDate: new Date(),
  });
  const [total, setTotal] = useState<number>();

  const [selectedExcludingTags, setSelectedExcludingTags] =
    useState<Tag[]>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagsSelectedNotifier = useRef(
    makeEventNotifier<{ tags: Tag[] }, unknown>(
      "OnTagsSelectedAndClosedInSummaryByType",
    ),
  ).current;

  const tagsSelectedListner = ({ tags }) => {
    setSelectedTags(tags);
  };

  tagsSelectedNotifier.useEventListener(tagsSelectedListner, []);

  const excludingTagsSelectedNotifier = useRef(
    makeEventNotifier<{ tags: Tag[] }, unknown>(
      "OnExcludingTagsSelectedAndClosedInSummaryByType",
    ),
  ).current;

  const excludingTagsSelectedListner = ({ tags }) => {
    setSelectedExcludingTags(tags);
  };

  excludingTagsSelectedNotifier.useEventListener(
    excludingTagsSelectedListner,
    [],
  );

  const createFilter = () => {
    return {
      tags: selectedTags ?? [],
      excludeTags: selectedExcludingTags ?? [],
      fromDate: rangeState[0].startDate,
      toDate: rangeState[0].endDate,
    } as Filter;
  };

  const getSummary = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api(createFilter());
      setTotal(roundUp(res.reduce((a, b) => a + b.totalAmount, 0)));
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSummary();
  }, [rangeState[0]]);

  const TransactionItem: React.FC<TransactionItemProps> = ({
    label,
    amount,
    index,
  }) => {
    return (
      <List.Item
        key={index}
        title={label}
        style={{ paddingVertical: 0 }}
        right={() => <Text style={{ alignSelf: "center" }}>{amount}</Text>}
      />
    );
  };

  return (
    <ScrollView
      contentContainerStyle={commonAddScreenStyles.scrollViewContainer}
    >
      <View style={commonStyles.row}>
        <View style={{ width: "50%" }}>
          <TagsSelectorButton
            selectedTags={selectedTags}
            notifyId={tagsSelectedNotifier.name}
          />
        </View>

        <View>
          <TagsSelectorButton
            label={"Excluding tags"}
            selectedTags={selectedExcludingTags}
            notifyId={excludingTagsSelectedNotifier.name}
          />
        </View>
      </View>

      <CustomDateRange rangeState={rangeState} />

      <Button
        mode="contained"
        onPress={getSummary}
        style={{ marginVertical: UI_ELEMENTS_GAP }}
      >
        See Report
      </Button>

      <LoadingError error={error} isLoading={isLoading} />
      <View
        style={{ ...commonStyles.simpleRow, marginLeft: UI_ELEMENTS_GAP * 2 }}
      >
        <Text variant={"titleSmall"} style={{ width: "45%" }}>
          Total
        </Text>
        <View style={{ width: "25%" }}>
          {result[0] && !!result[0].totalQuantity && (
            <Text variant={"titleSmall"}>{"Quantity"}</Text>
          )}
        </View>
        <Text variant={"titleSmall"}>{"Total Amount"}</Text>
      </View>
      {result.map((value, index) => {
        return (
          <View key={`result${index}`}>
            {value.subTransactions ? (
              <List.Accordion
                key={`accordion${index}`}
                title={value.baseTransactionType.name}
                left={(props) => <List.Icon {...props} icon="folder" />} // You can change the icon here
                right={() => (
                  <Text style={{ alignSelf: "center" }}>
                    {value.totalAmount}
                  </Text>
                )}
              >
                {value.subTransactions.map((sub, subIndex) => (
                  <View
                    style={{ marginLeft: UI_ELEMENTS_GAP }}
                    key={`${subIndex}${value.baseTransactionType.name}View`}
                  >
                    <TransactionItem
                      index={`${subIndex}${value.baseTransactionType.name}`}
                      label={sub.receiver.name}
                      amount={sub.totalAmount}
                    />
                  </View>
                ))}
              </List.Accordion>
            ) : (
              <TransactionItem
                index={index.toString()}
                label={value.baseTransactionType.name}
                amount={value.totalAmount}
              />
            )}
          </View>
        );
      })}
      <List.Item
        key={"Footer"}
        title={"Total"}
        style={{ paddingVertical: 0 }}
        right={() => <Text variant={"titleSmall"}>{total}</Text>}
      />
    </ScrollView>
  );
};

export default SummaryByType;
