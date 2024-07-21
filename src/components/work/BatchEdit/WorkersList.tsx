import UsersSelector from "../../common/UsersSelector";
import React, { useEffect, useState } from "react";
import filterService from "../../../service/FilterService";
import { Filter, User } from "../../../../types";
import LoadingError from "../../../../components/common/LoadingError";
import Button from "../../../../components/common/Button";
import { View } from "react-native";
import commonStyles from "../../../styles/commonStyles";
import { useRecoilState } from "recoil";
import { batchEditPayloadState } from "./atom";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

interface WorkersListProps {
  navigation: NavigationProp<ParamListBase>;
}

const WorkersList: React.FC<WorkersListProps> = ({ navigation }) => {
  const [uniqueFilters, setUniqueFilters] = useState<Filter>({
    sender: [],
    receiver: [],
    tags: [],
    user: [],
  });
  const selectedUserState = useState<User[]>([]);
  const [selectedUser] = selectedUserState;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [_editPayload, setEditPayload] = useRecoilState(batchEditPayloadState);

  const getUnique = async () => {
    try {
      const uniQueFilter = await filterService.getWorkFilters();
      setUniqueFilters(uniQueFilter);
    } catch (e) {
      setError(e.message || "Error setting filters.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUnique();
  }, []);

  const goToWorksList = () => {
    setEditPayload((prev) => ({ ...prev, user: selectedUser[0] }));

    navigation.navigate("WorkStack", {
      screen: "UserWorksList",
      params: { title: "Works List" },
    });
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError isLoading={isLoading} error={error} />
      <UsersSelector
        multiple={false}
        allUsers={uniqueFilters.user}
        selectedUserState={selectedUserState}
      />
      <Button
        disabled={!selectedUser[0]}
        icon={"page-next"}
        title={"Continue"}
        onPress={() => {
          goToWorksList();
        }}
      />
    </View>
  );
};

export default WorkersList;
