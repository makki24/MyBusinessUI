import React, { useEffect, useState } from "react";
import CustomDateRange from "../common/CustomDateRange";
import { Text } from "react-native-paper";
import { View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import LoadingError from "../../../components/common/LoadingError";
import { TransactionSummaryByType } from "./types";
import { Range } from "../users/report-summary.model";

interface SummaryByTypeProps {
  api: (arg1: Range) => Promise<TransactionSummaryByType[]>;
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSummary = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api(rangeState[0]);
      setTotal(res.reduce((a, b) => a + b.totalAmount, 0));
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

  return (
    <View style={commonStyles.container}>
      <CustomDateRange rangeState={rangeState} />
      <LoadingError error={error} isLoading={isLoading} />
      <View style={commonStyles.simpleRow}>
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
          <View style={commonStyles.simpleRow} key={index}>
            <Text style={{ width: "45%" }}>
              {value.baseTransactionType.name}
            </Text>
            <View style={{ width: "25%" }}>
              {!!value.totalQuantity && (
                <Text>
                  {value.totalQuantity}{" "}
                  {value.baseTransactionType.unit !== "null"
                    ? value.baseTransactionType.unit
                    : ""}
                </Text>
              )}
            </View>
            <Text style={{ alignSelf: "center" }}>{value.totalAmount}</Text>
          </View>
        );
      })}
      <View style={commonStyles.simpleRow}>
        <Text variant={"titleSmall"} style={{ width: "45%" }}>
          Total
        </Text>
        <Text style={{ width: "25%" }}>{""}</Text>
        <Text variant={"titleSmall"}>{total}</Text>
      </View>
    </View>
  );
};

export default SummaryByType;
