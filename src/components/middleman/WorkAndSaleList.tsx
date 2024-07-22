import ItemsList from "../common/ItemsList";
import React, { useState } from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { Filter } from "../../../types";
import { View } from "react-native";
import middleManService from "./MiddleManService";
import { workAndSalesState } from "./atom";
import commonStyles from "../../styles/commonStyles";
import { List } from "react-native-paper";
import Sale from "./Sale";
import WorkList from "./WorkList";

type WorkAndSaleListProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const WorkAndSaleList: React.FC<WorkAndSaleListProps> = ({ navigation }) => {
  const [uniqueFilters] = useState<Filter>({
    sender: [],
    receiver: [],
    tags: [],
    user: [],
  });

  const transformData = (items) =>
    items.map((item) => ({
      ...item,
      sale: {
        ...item.sale,
        date: new Date(item.sale.date),
      },
      works: [
        ...item.works.map((work) => ({ ...work, date: new Date(work.date) })),
      ],
    }));

  return (
    <View style={commonStyles.container}>
      <List.AccordionGroup>
        <ItemsList
          uniQueFilterValues={uniqueFilters}
          searchBar={false}
          sort={true}
          handleSearch={() => {
            return [];
          }}
          fetchData={middleManService.getWorksAndSales}
          recoilState={workAndSalesState}
          renderItem={({ item, index }) => (
            <List.Accordion title={<Sale sale={item.sale} />} id={index}>
              <WorkList item={item} />
            </List.Accordion>
          )}
          onAdd={() => {
            navigation.navigate("MiddleManStack", {
              screen: "AddSender",
              params: { title: "Select Sender" },
            });
          }}
          transFormData={transformData}
        />
      </List.AccordionGroup>
    </View>
  );
};

export default WorkAndSaleList;
