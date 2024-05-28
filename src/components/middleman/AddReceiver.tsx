import { View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import UsersSelector from "../common/UsersSelector";
import Button from "../../../components/common/Button";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { usersState } from "../../../recoil/atom";
import { User } from "../../../types";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import workAndSaleState from "./atom";

interface AddReceiverProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
}

const AddReceiver: React.FC<AddReceiverProps> = ({ navigation }) => {
  const [allUsers] = useRecoilState(usersState);
  const selectedUserState = useState<User[]>([]);
  const [selectedUser] = selectedUserState;
  const [filteredUsers, setFilteredUsers] = useState(allUsers);
  const [workAndSale, setWorkAndSale] = useRecoilState(workAndSaleState);

  useEffect(() => {
    setFilteredUsers(
      allUsers.filter((user) => user.id !== workAndSale?.sender?.id),
    );
  }, [workAndSale]);

  const onAddUser = () => {
    setWorkAndSale((prevState) => ({
      ...prevState,
      receiver: [selectedUser[0]],
    }));

    navigation.navigate("MiddleManStack", {
      screen: "WorkAndSale",
      params: { title: "Confirm Details " },
    });
  };

  return (
    <View style={commonStyles.container}>
      <UsersSelector
        multiple={false}
        allUsers={filteredUsers}
        selectedUserState={selectedUserState}
      />
      <Button
        disabled={!selectedUser[0]}
        icon={"plus"}
        title={"Add Receiver"}
        onPress={onAddUser}
      />
    </View>
  );
};

export default AddReceiver;
