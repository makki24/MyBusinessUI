import React, { useState } from "react";
import { View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import { useRecoilState } from "recoil";
import { usersState } from "../../../recoil/atom";
import { Sale, User } from "../../../types";
import UsersSelector from "../common/UsersSelector";
import Button from "../../../components/common/Button";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { middleManState } from "./atom";

interface AddSenderProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
}

const AddSender: React.FC<AddSenderProps> = ({ navigation }) => {
  const [allUsers] = useRecoilState(usersState);
  const selectedUserState = useState<User[]>([]);
  const [selectedUser] = selectedUserState;
  const [_workAndSale, setWorkAndSale] = useRecoilState(middleManState);

  const addSender = () => {
    setWorkAndSale({
      sale: {
        user: selectedUser[0],
      } as Sale,
      works: [],
    });
    navigation.navigate("MiddleManStack", {
      screen: "WorkTypeList",
      params: {
        title: "Select Work type",
        addingWork: true,
      },
    });
  };

  return (
    <View style={commonStyles.container}>
      <UsersSelector
        multiple={false}
        allUsers={allUsers}
        selectedUserState={selectedUserState}
      />
      <Button
        disabled={!selectedUser[0]}
        icon={"plus"}
        title={"Add Sender"}
        onPress={addSender}
      />
    </View>
  );
};

export default AddSender;
