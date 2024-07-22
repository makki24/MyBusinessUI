import { View } from "react-native";
import { Title } from "react-native-paper";
import UserDetails from "../../../components/common/UserDetails";
import React from "react";
import commonStyles from "../../styles/commonStyles";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import { Sale as SaleType } from "../../../types";

interface SaleProps {
  sale: SaleType;
}

const Sale: React.FC<SaleProps> = ({ sale }) => {
  return (
    <View>
      <View style={commonStyles.simpleRow}>
        <UserDetails user={sale.user} />

        <Title style={{ marginLeft: UI_ELEMENTS_GAP }}>
          {sale.amount.toString().substring(0, 7)} r.s
        </Title>
      </View>
    </View>
  );
};

export default Sale;
