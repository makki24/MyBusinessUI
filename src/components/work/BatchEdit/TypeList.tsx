import React from "react";
import WorkTypeList from "../../common/WorkTypeList";
import { useRecoilState } from "recoil";
import { batchEditPayloadState } from "./atom";
import commonStyles from "../../../styles/commonStyles";
import { View } from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

interface TypeListProps {
  navigation: NavigationProp<ParamListBase>;
}

const TypeList: React.FC<TypeListProps> = ({ navigation }) => {
  const [_editPayload, setEditPayload] = useRecoilState(batchEditPayloadState);

  const onPress = (item) => {
    setEditPayload((prev) => ({ ...prev, type: item }));
    navigation.navigate("WorkStack", {
      screen: "WorkersList",
      params: { title: "Select Type" },
    });
  };

  return (
    <View style={commonStyles.container}>
      <WorkTypeList
        onPress={onPress}
        onEdit={() => {}}
        onDelete={() => {}}
        readOnly={true}
      />
    </View>
  );
};

export default TypeList;
