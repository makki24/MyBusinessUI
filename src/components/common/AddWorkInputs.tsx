import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useRecoilState } from "recoil";
import NumberInput from "../../../components/common/NumberInput";
import DateTimePicker from "../../../components/common/DateTimePicker";
import SwitchInput from "../../../components/common/SwitchInput";
import commonStyles from "../../styles/commonStyles";
import commonAddScreenStyles from "../../styles/commonAddScreenStyles";
import { DateTime, WorkAndSale } from "../../../types";
import { middleManState } from "../middleman/atom";

interface AddWorkInputProps {
  onAddWork: (arg: WorkAndSale) => void;
  disabled: boolean;
}

const AddWorkInputs: React.FC<AddWorkInputProps> = ({
  onAddWork,
  disabled,
}) => {
  const [showPricePerUnit, setShowPricePerUnit] = useState(false);
  const [showAmount, setShowAmount] = useState(false);
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [inputDate, setInputDate] = useState(new Date());
  const [time, setTime] = useState<DateTime>({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
  });
  const [workAndSaleState, setWorkAndSaleState] =
    useRecoilState(middleManState);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [worksLength, setWorksLength] = useState(0);

  useEffect(() => {
    setWorksLength(workAndSaleState.works.length);
  }, [workAndSaleState]);

  useEffect(() => {
    setButtonDisabled(disabled);
  }, [disabled]);

  useEffect(() => {
    if (worksLength > 0) {
      const currentWork = workAndSaleState.works[worksLength - 1];
      setPricePerUnit(currentWork.type?.pricePerUnit?.toString() || "");
      if (currentWork.type?.enterAmountDirectly) {
        setShowAmount(true);
        setAmount(currentWork.type.pricePerUnit?.toString() || "");
        setQuantity("1");
      } else setQuantity(currentWork.quantity?.toString() || "");
      setDescription(currentWork.description || "");
    }
  }, [worksLength]);

  const addWork = () => {
    let calculatedAmount = parseFloat(pricePerUnit) * parseFloat(quantity);
    calculatedAmount = Math.round(calculatedAmount * 100.0) / 100.0;

    setWorkAndSaleState((prevState) => {
      const updatedWorks = prevState.works.map((work) => ({
        ...work,
        amount: showAmount ? parseFloat(amount) : calculatedAmount,
        pricePerUnit: showAmount
          ? parseFloat(amount)
          : parseFloat(pricePerUnit),
        quantity: parseFloat(quantity),
        description,
        date: new Date(inputDate.setHours(time.hours, time.minutes)),
      }));

      const updatedState = { ...prevState, works: updatedWorks };
      onAddWork(updatedState);
      return updatedState;
    });
  };

  return (
    <View>
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
      <Button mode="contained" onPress={addWork} disabled={buttonDisabled}>
        Add Work
      </Button>
    </View>
  );
};

export default AddWorkInputs;
