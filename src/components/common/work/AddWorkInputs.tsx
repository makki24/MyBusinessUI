import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { TextInput } from "react-native-paper";
import NumberInput from "../../../../components/common/NumberInput";
import DateTimePicker from "../../../../components/common/DateTimePicker";
import SwitchInput from "../../../../components/common/SwitchInput";
import commonStyles from "../../../styles/commonStyles";
import commonAddScreenStyles from "../../../styles/commonAddScreenStyles";
import { DateTime, Tag as Tags, WorkType } from "../../../../types";
import TagsSelectorButton from "../TagsSelectorButton";

interface AddWorkInputProps {
  states: {
    pricePerUnit: [string, React.Dispatch<React.SetStateAction<string>>];
    quantity: [string, React.Dispatch<React.SetStateAction<string>>];
    amount: [string, React.Dispatch<React.SetStateAction<string>>];
    description: [string, React.Dispatch<React.SetStateAction<string>>];
    date: [Date, React.Dispatch<React.SetStateAction<Date>>];
    time: [DateTime, React.Dispatch<React.SetStateAction<DateTime>>];
    tags: [Tags[], React.Dispatch<React.SetStateAction<Tags[]>>];
  };
  workType: WorkType;
}

export const AddWorkInputs: React.FC<AddWorkInputProps> = ({
  states,
  workType,
}) => {
  const [showPricePerUnit, setShowPricePerUnit] = useState(false);
  const [showAmount, setShowAmount] = useState(false);
  const [pricePerUnit, setPricePerUnit] = states.pricePerUnit;
  const [quantity, setQuantity] = states.quantity;
  const [amount, setAmount] = states.amount;
  const [description, setDescription] = states.description;
  const [inputDate, setInputDate] = states.date;
  const [time, setTime] = states.time;
  const [selectedTags] = states.tags;

  useEffect(() => {
    if (workType) {
      if (workType.enterAmountDirectly) {
        setShowAmount(true);
        setShowPricePerUnit(false);
      } else if (
        pricePerUnit &&
        pricePerUnit !== workType.pricePerUnit.toString()
      ) {
        setShowPricePerUnit(true);
      }
    }
  }, [workType]);

  useEffect(() => {
    if (showAmount) {
      setQuantity("1");
      setPricePerUnit(amount);
    }
  }, [amount]);

  return (
    <View>
      <TagsSelectorButton selectedTags={selectedTags} />
      <View style={{ ...commonStyles.row, justifyContent: "space-between" }}>
        <SwitchInput
          label="Show Price per unit"
          value={showPricePerUnit}
          onValueChange={(value) => {
            if (value) setShowAmount(!value);
            setShowPricePerUnit(value);
          }}
        />
        <SwitchInput
          label="Enter amount directly"
          value={showAmount}
          onValueChange={(value) => {
            setShowPricePerUnit(!value);
            setQuantity("1");
            setShowAmount(value);
          }}
        />
      </View>

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
        multiline
        numberOfLines={3}
      />
      <DateTimePicker
        label="Work date"
        dateValue={inputDate}
        onDateChange={setInputDate}
        onTimeChange={setTime}
        timeValue={time}
      />
    </View>
  );
};
