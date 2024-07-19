import { View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import UsersSelector from "../common/UsersSelector";
import Button from "../../../components/common/Button";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { usersState } from "../../../recoil/atom";
import { User, WorkAndSale } from "../../../types";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { middleManState } from "./atom";

interface AddReceiverProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
}

const AddReceiver: React.FC<AddReceiverProps> = ({ navigation }) => {
  const [allUsers] = useRecoilState(usersState);
  const selectedUserState = useState<User[]>([]);
  const [selectedUser] = selectedUserState;
  const [filteredUsers, setFilteredUsers] = useState(allUsers);
  const [workAndSale, setWorkAndSale] = useRecoilState(middleManState);

  useEffect(() => {
    setFilteredUsers(
      allUsers.filter((user) => user.id !== workAndSale?.sale.user?.id),
    );
  }, [workAndSale]);

  const onAddUser = () => {
    setWorkAndSale((prevState): WorkAndSale => {
      const works = [...prevState.works];
      works[works.length - 1] = {
        ...works[works.length - 1],
        user: selectedUser[0],
      };
      return {
        ...prevState,
        works,
      };
    });

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
