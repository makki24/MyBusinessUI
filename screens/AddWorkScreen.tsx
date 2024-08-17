import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { useRecoilState } from "recoil";
import { Button, TextInput } from "react-native-paper";

import { userState, usersState, worksState } from "../recoil/atom";
import WorkService from "../services/WorkService";
import { WorkType, Tag as Tags, User, Work } from "../types";
import CustomDropDown from "../components/common/CustomDropdown";
import SwitchInput from "../components/common/SwitchInput";
import DateTimePicker from "../components/common/DateTimePicker";
import commonAddScreenStyles from "../src/styles/commonAddScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import UserDropDownItem from "../components/common/UserDropDownItem";
import NumberInput from "../components/common/NumberInput";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useTagsClosed } from "../src/components/tags/TagsSelector";
import TagsSelectorButton from "../src/components/common/TagsSelectorButton";

interface AddWorkScreenProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
  route: {
    params: {
      isEditMode: boolean;
      workType: WorkType;
      work: Work;
    };
  };
}

const AddWorkScreen: React.FC<AddWorkScreenProps> = ({ route, navigation }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [workType, setWorkType] = useState<WorkType>(null);
  const [selectedTags, setSelectedTags] = useState<Tags[]>([]);
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [inputDate, setInputDate] = useState(new Date());
  const [time, setTime] = useState<{
    hours: number | undefined;
    minutes: number | undefined;
  }>({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
  });
  const [users] = useRecoilState(usersState);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loggedInUser] = useRecoilState(userState);
  const [showPricePerUnit, setShowPricePerUnit] = useState(false);
  const [showAmount, setShowAmount] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [_, setAllWorks] = useRecoilState(worksState);

  useEffect(() => {
    // Check if the screen is in edit mode and workType data is provided
    if (route.params?.workType) {
      setWorkType(route.params.workType);
      setPricePerUnit(`${route.params.workType.pricePerUnit}`);
      if (!selectedTags.length)
        setSelectedTags(route.params.workType.defaultTags ?? []);
      if (route.params.workType.enterAmountDirectly) {
        setShowAmount(true);
        setAmount(`${route.params.workType.pricePerUnit}`);
      }
    }
  }, [route.params?.workType]);

  useEffect(() => {
    // Check if the screen is in edit mode and workType data is provided
    if (route.params?.isEditMode && route.params?.work) {
      setIsEdit(true);
      const work = route.params.work as Work;
      const paramDate = new Date(work.date);

      setQuantity(`${work.quantity}`);
      setWorkType(work.type);
      setPricePerUnit(`${work.pricePerUnit}`);
      setAmount(`${work.amount}`);
      setDescription(work.description);
      setInputDate(paramDate);
      setSelectedTags(work.tags);
      setSelectedUser(work.user.id);
      setTime({ hours: paramDate.getHours(), minutes: paramDate.getMinutes() });
      if (work.pricePerUnit && work.pricePerUnit !== work.type.pricePerUnit)
        setShowPricePerUnit(true);
      if (!work.pricePerUnit) {
        setShowAmount(true);
      }
    }
  }, [route.params?.isEditMode, route.params?.work]);

  const timeDate = new Date();
  time.hours !== undefined && timeDate.setHours(time.hours);
  time.minutes !== undefined && timeDate.setMinutes(time.minutes);

  const handleUserChange = (user: string | null) => {
    if (user) setSelectedUser(user);
  };

  useTagsClosed(({ tags }) => {
    setSelectedTags(tags);
  }, []);

  const openTags = () => {
    const index = navigation.getParent().getState().index;
    const stack = navigation.getParent().getState().routes[index].name;
    navigation.navigate(stack, {
      screen: "TagsSelector",
      params: {
        selectedTags: selectedTags,
      },
    });
  };

  const submitWork = async () => {
    try {
      setIsLoading(true);
      const workDate = new Date(inputDate);
      workDate.setHours(time.hours, time.minutes);
      let calculatedAmount = parseFloat(amount);

      if (!showAmount) {
        // Calculate amount based on Price per unit and Quantity
        if (pricePerUnit) {
          calculatedAmount = parseFloat(pricePerUnit) * parseFloat(quantity);
        }
      } else {
        setPricePerUnit(null);
      }

      let newWork: Work = {
        date: workDate,
        type: workType,
        quantity: showAmount ? 1 : parseFloat(quantity),
        pricePerUnit: showAmount ? calculatedAmount : parseFloat(pricePerUnit),
        amount: calculatedAmount,
        description,
        user: selectedUser ? ({ id: selectedUser } as User) : null,
        tags: selectedTags,
      };

      if (isEdit) {
        newWork.id = route.params.work.id;
      }

      newWork = await WorkService.addWork(newWork);

      newWork.date = new Date(newWork.date);
      setAllWorks((prevWorks) => [
        ...prevWorks.filter((wt) => wt.id !== newWork.id),
        newWork,
      ]);

      // Add logic to update Recoil state or other actions based on the new work

      setQuantity("");
      setWorkType(null);
      setPricePerUnit("");
      setAmount("");
      setDescription("");

      navigation.goBack();
    } catch (err) {
      setError(err.message ?? "An error occurred while adding the work");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWork = () => {
    if (!selectedUser) {
      setError("User is required");
      return;
    }
    if (!showAmount && (!workType || !quantity)) {
      setError("Work type and quantity are required");
      return;
    }

    submitWork();
  };

  // Component rendering
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={commonAddScreenStyles.scrollViewContainer}
    >
      <LoadingError error={error} isLoading={isLoading} />

      {/* Switch to show/hide Price per unit field */}
      <View style={{ ...commonStyles.row, justifyContent: "space-between" }}>
        <SwitchInput
          label={"Show Price per unit"}
          value={showPricePerUnit}
          onValueChange={(value) => {
            if (value) setShowAmount(false);
            setShowPricePerUnit(value);
          }}
        />
        <SwitchInput
          label={"Enter amount directly"}
          value={showAmount}
          onValueChange={(showAmountParam) => {
            if (showAmountParam) {
              setShowPricePerUnit(false);
              setQuantity(`1`);
            }
            setShowAmount(showAmountParam);
          }}
        />
      </View>

      {/* New selector for tags */}
      <TagsSelectorButton openTags={openTags} selectedTags={selectedTags} />

      {/* Additional selector for users if required */}
      {workType && (
        <CustomDropDown
          schema={{
            label: "name",
            value: "id",
          }}
          zIndex={1000}
          zIndexInverse={1000}
          items={users.filter(
            (user) =>
              (user.phoneNumber || user.email) &&
              user.email !== loggedInUser.email,
          )}
          searchable={true}
          open={userOpen}
          setOpen={setUserOpen}
          containerStyle={{ height: 40, marginBottom: 16 }}
          value={selectedUser}
          setValue={handleUserChange}
          itemSeparator={true}
          placeholder="Select User"
          testID={"user-select"}
          onChangeValue={handleUserChange}
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

      {/* Input fields for quantity, price per unit, amount, and description */}
      {showPricePerUnit && (
        <NumberInput
          label="Price per unit"
          value={pricePerUnit}
          onChangeText={setPricePerUnit}
        />
      )}

      {!showAmount && (
        <NumberInput
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
        />
      )}

      {showAmount && (
        <NumberInput label="Amount" value={amount} onChangeText={setAmount} />
      )}

      <TextInput
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        style={commonAddScreenStyles.inputField}
      />

      {/* Time picker */}
      <DateTimePicker
        label="Work date"
        dateValue={inputDate}
        onDateChange={setInputDate}
        onTimeChange={setTime}
        timeValue={time}
      />

      {/* Button to add the work */}
      <Button mode="contained" onPress={handleAddWork} disabled={isLoading}>
        {isEdit ? "Save Work" : "Add Work"}
      </Button>
    </ScrollView>
  );
};

export default AddWorkScreen;
