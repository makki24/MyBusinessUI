import React from "react";
import { FlatList, View } from "react-native";
import { UI_ELEMENTS_GAP } from "../../styles/constants";
import Button from "../../../components/common/Button";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useRecoilState } from "recoil";
import { middleManState } from "./atom";
import WorkItemWithActions from "../common/work/WorkItemWithActions";
import { WorkAndSale } from "../../../types";

type RootStackParamList = {
  [key: string]: {
    screen: string;
    params: {
      title: string;
      work?: unknown;
      isEditMode?: boolean;
    };
  };
  // Add other screens here
};

type NavigationProp = StackNavigationProp<RootStackParamList, "MiddleManStack">;

interface WorkListProps {
  item: WorkAndSale;
}

const WorkList: React.FC<WorkListProps> = ({ item }) => {
  const works = item.works;
  const navigation = useNavigation<NavigationProp>();
  const [_workAndSale, setWorkAndSale] = useRecoilState(middleManState);

  const addMoreWork = () => {
    setWorkAndSale({
      id: item.id,
      works: [],
      sale: item.sale,
    });
    navigation.navigate("MiddleManStack", {
      screen: "WorkTypeList",
      params: {
        title: "Select Work type",
      },
    });
  };

  return (
    <View style={{ padding: UI_ELEMENTS_GAP * 3, paddingTop: 0 }}>
      <FlatList
        data={works}
        renderItem={({ item: workItem }) => (
          <WorkItemWithActions item={workItem} />
        )}
      />
      <Button
        icon={"plus"}
        mode="contained"
        onPress={() => addMoreWork()}
        title={"Add more work"}
      />
    </View>
  );
};

export default WorkList;
