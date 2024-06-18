import NumberInput from "../../../components/common/NumberInput";
import { Button, TextInput } from "react-native-paper";
import commonAddScreenStyles from "../../styles/commonAddScreenStyles";
import DateTimePicker from "../../../components/common/DateTimePicker";
import React, { useEffect, useState } from "react";
import { DateTime, WorkAndSale } from "../../../types";
import { useRecoilState } from "recoil";
import workAndSaleRecoilState from "../middleman/atom";
import commonStyles from "../../styles/commonStyles";
import SwitchInput from "../../../components/common/SwitchInput";
import { View } from "react-native";

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
  const [workAndSaleState, setWorkAndSaleState] = useRecoilState(
    workAndSaleRecoilState,
  );
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    setButtonDisabled(disabled);
  }, [disabled]);

  useEffect(() => {
    setPricePerUnit(`${workAndSaleState.type?.pricePerUnit}`);
    if (workAndSaleState.type?.enterAmountDirectly) {
      setShowAmount(true);
      setAmount(`${workAndSaleState.type.pricePerUnit}`);
    }

    if (workAndSaleState.quantity) setQuantity(`${workAndSaleState.quantity}`);
    if (workAndSaleState.description)
      setDescription(workAndSaleState.description);
  }, []);

  const addWork = () => {
    setButtonDisabled(true);
    let calculatedAmount = parseFloat(pricePerUnit) * parseFloat(quantity);
    calculatedAmount = Math.round(calculatedAmount * 100.0) / 100.0;
    if (showAmount)
      setWorkAndSaleState((prev) => ({
        ...prev,
        pricePerUnit: parseFloat(amount),
        amount: parseFloat(amount),
      }));
    else
      setWorkAndSaleState((prev) => ({
        ...prev,
        amount: calculatedAmount,
        pricePerUnit: parseFloat(pricePerUnit),
        quantity: parseFloat(quantity),
      }));
    setWorkAndSaleState((prev) => ({
      ...prev,
      description: description,
    }));
    const workDate = new Date(inputDate);
    workDate.setHours(time.hours, time.minutes);
    setWorkAndSaleState((prev) => {
      onAddWork({ ...prev, date: workDate });
      return { ...prev, date: workDate };
    });
  };

  return (
    <>
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
        multiline={true}
        numberOfLines={3}
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
      <Button mode="contained" onPress={addWork} disabled={buttonDisabled}>
        Add Work
      </Button>
    </>
  );
};

export default AddWorkInputs;
