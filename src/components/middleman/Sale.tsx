import { View } from "react-native";
import { Title } from "react-native-paper";
import UserDetails from "../../../components/common/UserDetails";
import React from "react";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import { Sale as SaleType } from "../../../types";
import { CURRENCY_SYMBOL } from "../../constants/labels";

interface SaleProps {
  sale: SaleType;
}

const Sale: React.FC<SaleProps> = ({ sale }) => {
  return (
    <View style={{ marginBottom: UI_ELEMENTS_GAP }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 12,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
        }}
      >
        <View style={{ flex: 1 }}>
          <UserDetails user={sale.user} />
        </View>
        <View>
          <Title
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#2E7D32", // Success Green for readability
            }}
          >
            {sale.amount.toString().substring(0, 7)} {CURRENCY_SYMBOL}
          </Title>
        </View>
      </View>
    </View>
  );
};

export default Sale;
