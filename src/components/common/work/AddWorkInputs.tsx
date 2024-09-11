import React, { useEffect, useState } from "react";
import { DateTime, Tag as Tags, WorkType } from "../../../../types";
import CommonAddFormInputs from "../CommonAddFormInputs";

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
  const showAmountState = useState(false);
  const showPricePerUnitState = useState(false);

  const [_showPricePerUnit, setShowPricePerUnit] = showPricePerUnitState;
  const [_showAmount, setShowAmount] = showAmountState;
  const [pricePerUnit] = states.pricePerUnit;

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

  return (
    <CommonAddFormInputs
      states={{
        tags: states.tags,
        quantity: states.quantity,
        amount: states.amount,
        pricePerUnit: states.pricePerUnit,
        date: states.date,
        time: states.time,
        description: states.description,
        showAmount: showAmountState,
        showPricePerUnit: showPricePerUnitState,
      }}
    />
  );
};
