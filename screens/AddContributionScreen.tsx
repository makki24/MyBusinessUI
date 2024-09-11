// AddContributionScreen.tsx
import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRecoilState } from "recoil";
import { userState } from "../recoil/atom";
import { Contribution, Tag as Tags } from "../types";
import contributionService from "../services/ContributionService";
import commonAddScreenStyles from "../src/styles/commonAddScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import Modal from "../components/common/Modal";
import CommonAddFormInputs from "../src/components/common/CommonAddFormInputs";
import { useTagsClosed } from "../src/components/tags/TagsSelector";

let oldAmount = 0;

interface AddContributionScreenProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
  route: {
    params: {
      isEditMode: boolean;
      contribution: Contribution;
    };
  };
}

const AddContributionScreen: React.FC<AddContributionScreenProps> = ({
  navigation,
  route,
}) => {
  const [loggedInUser, setLoggedInUser] = useRecoilState(userState);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage] = useState("");

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
  const showPricePerUnitState = useState(false);
  const showAmountState = useState(true);

  const [selectedTags, setSelectedTags] = tagsState;
  const [quantity] = quantityState;
  const [pricePerUnit] = pricePerUnitState;
  const [amount, setAmount] = amountState;
  const [description] = descriptionState;
  const [inputDate, setInputDate] = inputDateState;
  const [time, setTime] = timeState;
  const [showPricePerUnit] = showPricePerUnitState;
  const [_showAmount, setShowAmount] = showAmountState;

  useTagsClosed(({ tags }) => {
    setSelectedTags(tags);
  }, []);

  useEffect(() => {
    if (route.params?.isEditMode && route.params?.contribution) {
      const extractedContribution = route.params.contribution;
      const paramDate = new Date(extractedContribution.date);

      setAmount(`${extractedContribution.amount}`);
      oldAmount = extractedContribution.amount;
      setInputDate(paramDate);
      setTime({ hours: paramDate.getHours(), minutes: paramDate.getMinutes() });
      setSelectedTags(extractedContribution.tags);
    }
  }, [route.params?.isEditMode, route.params?.contribution]);

  const handleModalClose = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    if (!showPricePerUnit) setShowAmount(true);
  }, [showPricePerUnit]);

  const submitContribution = async () => {
    try {
      setIsLoading(true);
      const contributionDate = new Date(inputDate);
      contributionDate.setHours(time.hours, time.minutes);
      const contribution: Contribution = {
        amount: parseFloat(amount),
        date: contributionDate,
        receiver: loggedInUser,
        quantity: +quantity,
        pricePerUnit: +pricePerUnit,
        description,
        tags: selectedTags,
      };
      let newAmount = loggedInUser.amountHolding + contribution.amount;

      if (route.params?.isEditMode && route.params?.contribution) {
        contribution.id = route.params.contribution.id;
        newAmount = newAmount - oldAmount;
      }

      await contributionService.updateContribution(contribution);
      setLoggedInUser((user) => ({
        ...user,
        amountHolding: newAmount,
      }));
      setAmount("");
      navigation.goBack();
    } catch (addError) {
      setError(
        addError.message ?? "An error occurred while updating the amount",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addContribution = async () => {
    setError("");
    if (!amount) {
      setError("Amount is needed");
      return;
    }
    submitContribution();
  };

  return (
    <ScrollView
      contentContainerStyle={commonAddScreenStyles.scrollViewContainer}
    >
      <LoadingError error={error} isLoading={isLoading} />

      <CommonAddFormInputs
        states={{
          tags: tagsState,
          quantity: quantityState,
          amount: amountState,
          pricePerUnit: pricePerUnitState,
          date: inputDateState,
          time: timeState,
          description: descriptionState,
          showAmount: showAmountState,
          showPricePerUnit: showPricePerUnitState,
        }}
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

      <Modal
        isModalVisible={modalVisible}
        setIsModalVisible={handleModalClose}
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
    </ScrollView>
  );
};

export default AddContributionScreen;
