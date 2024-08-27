import { WorkType } from "../../types";

export const getAddWorkTitle = (type: WorkType): string => {
  return (
    `Add ${type.name}` +
    (type.unit !== "null" ? ` (${type.pricePerUnit} per ${type.unit})` : "")
  );
};
