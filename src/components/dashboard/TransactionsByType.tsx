import { View } from "react-native";
import { List, Text } from "react-native-paper";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import React from "react";
import { TransactionSummaryByType } from "./types";

interface TransactionsByTypeProps {
  value: TransactionSummaryByType;
  index: number;
}

interface TransactionItemProps {
  label: string;
  amount: string;
  index: string;
  value?: TransactionSummaryByType;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  label,
  amount,
  index,
  value,
}) => {
  return (
    <List.Item
      key={index}
      title={label}
      style={{ paddingVertical: 0 }}
      right={() => (
        <Text style={{ alignSelf: "center" }}>
          {amount}
          {value && !!value.totalQuantity && (
            <Text>
              {" ("}
              {value.totalQuantity}{" "}
              {value.baseTransactionType?.unit !== "null"
                ? value.baseTransactionType.unit
                : ""}
              {")"}
            </Text>
          )}
        </Text>
      )}
    />
  );
};

const TransactionsByType: React.FC<TransactionsByTypeProps> = ({
  value,
  index,
}) => {
  return (
    <>
      {value.subTransactions ? (
        <List.Accordion
          key={`accordion${index}`}
          title={value.baseTransactionType.name}
          left={(props) => <List.Icon {...props} icon="folder" />}
          right={() => (
            <Text style={{ alignSelf: "center" }}>{value.totalAmount}</Text>
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
                amount={`${sub.totalAmount}`}
              />
            </View>
          ))}
        </List.Accordion>
      ) : (
        <TransactionItem
          index={index.toString()}
          label={value.baseTransactionType.name}
          amount={`${value.totalAmount}`}
          value={value}
        />
      )}
    </>
  );
};

export default TransactionsByType;
