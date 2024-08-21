import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { useRecoilState } from "recoil";
import { Button, Text } from "react-native-paper";

import { userState, usersState, worksState } from "../recoil/atom";
import WorkService from "../services/WorkService";
import { WorkType, Tag as Tags, User, Work } from "../types";
import CustomDropDown from "../components/common/CustomDropdown";
import commonAddScreenStyles from "../src/styles/commonAddScreenStyles";
import LoadingError from "../components/common/LoadingError";
import UserDropDownItem from "../components/common/UserDropDownItem";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useTagsClosed } from "../src/components/tags/TagsSelector";
import { AddWorkInputs } from "../src/components/common/work/AddWorkInputs";
import WorkTypeSelectorButton from "../src/components/work/AddWork/WorkTypeSelectorButton";
import { getAddWorkTitle } from "../src/util/Work";

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

  const workTypeState = useState<WorkType>(null);
  const tagsState = useState<Tags[]>([]);
  const quantityState = useState("");
  const pricePerUnitState = useState("");
  const amountState = useState("");
  const descriptionState = useState("");
  const inputDateState = useState(new Date());
  const timeState = useState<{
    hours: number | undefined;
    minutes: number | undefined;
  }>({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
  });

  const [selectedTags, setSelectedTags] = tagsState;
  const [quantity, setQuantity] = quantityState;
  const [pricePerUnit, setPricePerUnit] = pricePerUnitState;
  const [_amount, setAmount] = amountState;
  const [description, setDescription] = descriptionState;
  const [inputDate, setInputDate] = inputDateState;
  const [time, setTime] = timeState;
  const [workType, setWorkType] = workTypeState;

  const [users] = useRecoilState(usersState);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loggedInUser] = useRecoilState(userState);
  const [isEdit, setIsEdit] = useState(false);
  const [_, setAllWorks] = useRecoilState(worksState);
  const [prevWork, setPrevWork] = useState(null);

  useEffect(() => {
    // Check if the screen is in edit mode and workType data is provided
    if (route.params?.workType) {
      setWorkType(route.params.workType);
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

  useEffect(() => {
    if (workType) {
      navigation.setParams({ title: getAddWorkTitle(workType) });
      if (!isEdit) {
        setPricePerUnit(`${workType.pricePerUnit}`);
        if (!selectedTags.length) setSelectedTags(workType.defaultTags ?? []);
        if (workType.enterAmountDirectly) {
          setAmount(`${workType.pricePerUnit}`);
        }
      }
    }
  }, [workType]);

  const submitWork = async () => {
    try {
      setError("");
      setIsLoading(true);
      const workDate = new Date(inputDate);
      workDate.setHours(time.hours, time.minutes);
      const calculatedAmount = parseFloat(pricePerUnit) * parseFloat(quantity);

      let newWork: Work = {
        date: workDate,
        type: workType,
        quantity: parseFloat(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        amount: calculatedAmount,
        description,
        user: selectedUser ? ({ id: selectedUser } as User) : null,
        tags: selectedTags,
      };

      if (
        prevWork &&
        newWork.type.id === prevWork.type.id &&
        newWork.quantity === prevWork.quantity &&
        newWork.pricePerUnit === prevWork.pricePerUnit &&
        newWork.user.id === prevWork.user.id
      ) {
        setError("This work is already saved");
        return;
      }

      if (isEdit) {
        newWork.id = route.params.work.id;
      }

      newWork = await WorkService.addWork(newWork);

      newWork.date = new Date(newWork.date);
      setAllWorks((prevWorks) => [
        newWork,
        ...prevWorks.filter((wt) => wt.id !== newWork.id),
      ]);
      setPrevWork(newWork);

      // Add logic to update Recoil state or other actions based on the new work

      if (isEdit) navigation.navigate("WorkStack", { screen: "Work" });
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
    if (!workType) {
      setError("Work type is required");
      return;
    }
    if (!quantity) {
      setError("Quantity is required");
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

      <WorkTypeSelectorButton workType={workTypeState} />

      <AddWorkInputs
        workType={workType}
        states={{
          tags: tagsState,
          quantity: quantityState,
          amount: amountState,
          pricePerUnit: pricePerUnitState,
          date: inputDateState,
          time: timeState,
          description: descriptionState,
        }}
      />

      {/* Button to add the work */}
      <Button mode="contained" onPress={handleAddWork} disabled={isLoading}>
        {isEdit ? "Save Work" : "Add Work"}
      </Button>

      {prevWork && (
        <>
          <Text variant={"titleSmall"}>
            Successfully created above work with id {prevWork.id}
          </Text>
        </>
      )}
    </ScrollView>
  );
};

export default AddWorkScreen;
