import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";
import { useRecoilState } from "recoil";
import {
  Tag as Tags,
  WorkAndSale as WorkAndSaleType,
  WorkAndSale,
} from "../../../types";
import { middleManState } from "./atom";
import { AddWorkInputs as CommonAddWorkInputs } from "../common/work/AddWorkInputs";
import { useTagsClosed } from "../tags/TagsSelector";

interface AddWorkInputProps {
  onAddWork: (arg: WorkAndSale) => void;
  disabled: boolean;
}

const AddWorkInputs: React.FC<AddWorkInputProps> = ({
  onAddWork,
  disabled,
}) => {
  const [showAmount, setShowAmount] = useState(false);

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

  const [_selectedTags, setSelectedTags] = tagsState;
  const [quantity, setQuantity] = quantityState;
  const [pricePerUnit, setPricePerUnit] = pricePerUnitState;
  const [amount, setAmount] = amountState;
  const [description, setDescription] = descriptionState;
  const [inputDate] = inputDateState;
  const [time] = timeState;

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

  useTagsClosed(({ tags }) => {
    setSelectedTags(tags);
    setWorkAndSaleState(
      (prev): WorkAndSaleType => ({
        ...prev,
        sale: { ...prev.sale, tags: tags },
        works: [...prev.works.map((work) => ({ ...work, tags: tags }))],
      }),
    );
  }, []);

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
      <CommonAddWorkInputs
        states={{
          tags: tagsState,
          quantity: quantityState,
          amount: amountState,
          pricePerUnit: pricePerUnitState,
          date: inputDateState,
          time: timeState,
          description: descriptionState,
        }}
        workType={workAndSaleState.works[0]?.type}
      />
      <Button mode="contained" onPress={addWork} disabled={buttonDisabled}>
        Add Work
      </Button>
    </View>
  );
};

export default AddWorkInputs;
