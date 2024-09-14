// AddContributionScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import { ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { useRecoilState } from "recoil";
import { userState } from "../recoil/atom";
import { Contribution, Tag, Tag as Tags } from "../types";
import contributionService from "../services/ContributionService";
import commonAddScreenStyles from "../src/styles/commonAddScreenStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import CommonAddFormInputs from "../src/components/common/CommonAddFormInputs";
import { makeEventNotifier } from "../src/components/common/useEventListner";

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
  const showPricePerUnitState = useState(null);
  const showAmountState = useState(null);

  const [selectedTags, setSelectedTags] = tagsState;
  const [quantity, setQuantity] = quantityState;
  const [pricePerUnit, setPricePerUnit] = pricePerUnitState;
  const [amount, setAmount] = amountState;
  const [description] = descriptionState;
  const [inputDate, setInputDate] = inputDateState;
  const [time, setTime] = timeState;
  const [showPricePerUnit, setShowPricePerUnit] = showPricePerUnitState;
  const [_showAmount, setShowAmount] = showAmountState;

  const tagsSelectedNotifier = useRef(
    makeEventNotifier<{ tags: Tag[] }, unknown>(
      "OnTagsSelectedAndClosedInAddContributionScreen",
    ),
  ).current;

  const tagsSelectedListner = ({ tags }) => {
    setSelectedTags(tags);
  };

  tagsSelectedNotifier.useEventListener(tagsSelectedListner, []);

  useEffect(() => {
    if (route.params?.isEditMode && route.params?.contribution) {
      const extractedContribution = route.params.contribution;
      const paramDate = new Date(extractedContribution.date);

      setAmount(`${extractedContribution.amount}`);
      oldAmount = extractedContribution.amount;
      setInputDate(paramDate);
      setTime({ hours: paramDate.getHours(), minutes: paramDate.getMinutes() });
      setSelectedTags(extractedContribution.tags);
      if (extractedContribution.quantity) {
        setQuantity(extractedContribution.quantity.toString());
        if (extractedContribution.quantity > 1) {
          setShowPricePerUnit(true);
          setShowAmount(false);
        } else {
          setShowPricePerUnit(false);
        }
      }
      if (extractedContribution.pricePerUnit)
        setPricePerUnit(extractedContribution.pricePerUnit.toString());
    } else {
      setShowPricePerUnit(false);
    }
  }, [route.params?.isEditMode, route.params?.contribution]);

  useEffect(() => {
    if (showPricePerUnit === false) setShowAmount(true);
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
    if (!amount && !pricePerUnit && !quantity) {
      setError("Amount is needed or pricePerUnit and quantity is needed");
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
        tagsSelectedNotifier={tagsSelectedNotifier.name}
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
    </ScrollView>
  );
};

export default AddContributionScreen;
