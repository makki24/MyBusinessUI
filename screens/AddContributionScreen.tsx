// AddContributionScreen.tsx
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, ScrollView } from "react-native";
import { Button, TextInput, Text, Portal, Modal } from "react-native-paper";
import { useRecoilState } from "recoil";
import { tagsState, usersState, userState } from "../recoil/atom";
import UserDropDownItem from "../components/common/UserDropDownItem";
import CustomDropDown from "../components/common/CustomDropdown";
import DateTimePicker from "../components/common/DateTimePicker";
import SwitchInput from "../components/common/SwitchInput"; // Import SwitchInput component
import { Contribution, Tag, User } from "../types";
import contributionService from "../services/ContributionService";
import commonAddScreenStyles from "../src/styles/commonAddScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import NumberInput from "../components/common/NumberInput";

let oldAmount = 0;

const AddContributionScreen = ({ navigation, route }) => {
  const [amountToAdd, setAmountToAdd] = useState("");
  const [loggedInUser, setLoggedInUser] = useRecoilState(userState);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useRecoilState(usersState);
  const [userOpen, setUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [inputDate, setInputDate] = useState(new Date());
  const [time, setTime] = useState({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
  });
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tagOpen, setTagOpen] = useState(false);
  const [tags, setTags] = useRecoilState(tagsState);
  const [isSelf, setIsSelf] = useState(false); // State for SwitchInput
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (route.params?.isEditMode && route.params?.contribution) {
      const extractedContribution = route.params.contribution;
      const paramDate = new Date(extractedContribution.date);

      setAmountToAdd(`${extractedContribution.amount}`);
      oldAmount = extractedContribution.amount;
      setSelectedUser(extractedContribution.sendingMember?.id || null);
      setInputDate(paramDate);
      setTime({ hours: paramDate.getHours(), minutes: paramDate.getMinutes() });
      setSelectedTags(extractedContribution.tags.map((tag) => tag.id));
    }
  }, [route.params?.isEditMode, route.params?.contribution]);

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const navigateToManageAmounts = () => {
    // Implement navigation logic to manage amounts screen
    handleModalClose();
  };

  const submitContribution = async () => {
    try {
      setIsLoading(true);
      const contributionDate = new Date(inputDate);
      contributionDate.setHours(time.hours, time.minutes);
      const contribution: Contribution = {
        sender: selectedUser ? ({ id: selectedUser } as User) : null,
        amount: parseFloat(amountToAdd),
        date: contributionDate,
        receiver: loggedInUser,
        tags: selectedTags.map((tag) => ({ id: tag })) as Tag[],
      };
      let newAmount = loggedInUser.amountHolding + contribution.amount;

      if (route.params?.isEditMode && route.params?.contribution) {
        contribution.id = route.params.contribution.id;
        newAmount = newAmount - oldAmount;
      }

      const response =
        await contributionService.updateContribution(contribution);
      setLoggedInUser((user) => ({
        ...user,
        amountHolding: newAmount,
      }));
      setAmountToAdd("");
      navigation.goBack();
    } catch (error) {
      setError(error.message ?? "An error occurred while updating the amount");
    } finally {
      setIsLoading(false);
    }
  };

  const addContribution = async () => {
    setError("");
    if (!amountToAdd) {
      setError("Amount is needed");
      return;
    }

    if (!isSelf) {
      const sendingUser = allUsers.filter(
        (user) => user.id === selectedUser,
      )[0];

      if (selectedUser && parseFloat(amountToAdd) > sendingUser.amountHolding) {
        setModalMessage(
          "User has less amount to pay. The rest of the amount will be considered as a loan.",
        );
        setModalVisible(true);
        return;
      }
    }
    submitContribution();
  };

  return (
    <ScrollView
      contentContainerStyle={commonAddScreenStyles.scrollViewContainer}
    >
      <LoadingError error={error} isLoading={isLoading} />

      <SwitchInput label="Is Self ?" value={isSelf} onValueChange={setIsSelf} />

      {!isSelf && (
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
      )}

      {isSelf && (
        <CustomDropDown
          multiple={true}
          items={tags}
          zIndex={1000}
          zIndexInverse={1000}
          schema={{
            label: "name",
            value: "id",
          }}
          open={tagOpen}
          setOpen={setTagOpen}
          containerStyle={{ height: 40, marginBottom: 16 }}
          value={selectedTags}
          setValue={setSelectedTags}
          itemSeparator={true}
          placeholder="Select Tags"
        />
      )}

      <NumberInput
        label="Amount to Add"
        value={amountToAdd}
        onChangeText={setAmountToAdd}
      />

      <DateTimePicker
        label="Date"
        dateValue={inputDate}
        onDateChange={setInputDate}
        onTimeChange={setTime}
        timeValue={time}
      />

      <Button
        icon="plus"
        mode="contained"
        onPress={addContribution}
        style={commonAddScreenStyles.button}
      >
        {route.params?.isEditMode
          ? "Update Contribution"
          : "Declare the contribution"}
      </Button>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={handleModalClose}
          contentContainerStyle={commonStyles.modalContainer}
        >
          <Text>{modalMessage}</Text>
          <View style={commonStyles.modalButtonGap} />
          <Button icon="check" mode="contained" onPress={submitContribution}>
            Continue
          </Button>
          <View style={commonStyles.modalButtonGap} />
          <Button icon="cancel" mode="outlined" onPress={handleModalClose}>
            Cancel
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

export default AddContributionScreen;
