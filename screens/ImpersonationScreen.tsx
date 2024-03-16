// AddContributionScreen.tsx
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useRecoilState } from "recoil";
import { usersState, userState } from "../recoil/atom";
import UserDropDownItem from "../components/common/UserDropDownItem";
import CustomDropDown from "../components/common/CustomDropdown";
import { Contribution } from "../types";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import Button from "../components/common/Button";
import { CONTAINER_PADDING, UI_ELEMENTS_GAP } from "../src/styles/constants";
import adminService from "../services/AdminService";

interface ImpersonationScreenProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
  route: {
    params: {
      isEditMode: boolean;
      contribution: Contribution;
    };
  };
}

const ImpersonationScreen: React.FC<ImpersonationScreenProps> = ({
  navigation,
}) => {
  const [loggedInUser, setLoggedInUser] = useRecoilState(userState);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers] = useRecoilState(usersState);
  const [userOpen, setUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const submitContribution = async () => {
    try {
      setIsLoading(true);
      const impersonatedUser = await adminService.impersonate(
        allUsers.filter((user) => user.id === selectedUser)[0],
      );
      setLoggedInUser(impersonatedUser);
      navigation.goBack();
    } catch (addError) {
      setError(
        addError.message ?? "An error occurred while updating the amount",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const backupDb = async () => {
    try {
      setIsLoading(true);
      await adminService.upload();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const restore = async () => {
    try {
      setIsLoading(true);
      await adminService.restore();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: CONTAINER_PADDING, flexGrow: 1 }}
    >
      <LoadingError error={error} isLoading={isLoading} />

      <CustomDropDown
        schema={{
          label: "name",
          value: "id",
        }}
        zIndex={2000}
        zIndexInverse={2000}
        items={allUsers.filter(
          (user) =>
            (user.phoneNumber || user.email) &&
            user.email !== loggedInUser.email,
        )}
        searchable={true}
        open={userOpen}
        setOpen={setUserOpen}
        containerStyle={{ height: 40, marginBottom: 16 }}
        value={selectedUser}
        setValue={setSelectedUser}
        itemSeparator={true}
        placeholder="Select User"
        renderListItem={({ item }) => (
          <UserDropDownItem
            item={item}
            setSelectedUser={setSelectedUser}
            selectedUser={selectedUser}
            setUserOpen={setUserOpen}
          />
        )}
      />
      <Button
        icon={"account-cowboy-hat"}
        mode="contained"
        onPress={submitContribution}
        title="Impersonate User"
      />
      <Button
        style={{ marginTop: UI_ELEMENTS_GAP }}
        icon={"upload"}
        mode="contained"
        onPress={backupDb}
        title="Backup Database"
      />

      <Button
        style={{ marginTop: UI_ELEMENTS_GAP }}
        icon={"reply"}
        mode="contained"
        onPress={restore}
        title="Restore"
        disabled={true}
      />
    </ScrollView>
  );
};

export default ImpersonationScreen;
