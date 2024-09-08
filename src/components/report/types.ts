export interface UserAllWorks {
  pricePerUnit: number;
  totalAmount: number;
  typeName: string;
  userId: number;
  userName: string;
  userWorkTypePricePerUnit: number;
  updatedTotalAmount?: number;
}

export interface CollapsedGroups {
  [key: string]: boolean;
}

export interface GroupedData {
  [key: string]: UserAllWorks[];
}

export interface PricePerUnitAndTypeGroupedData {
  groupedData: GroupedData;
  totalOfAll: number;
  profit: number;
}

export interface GroupTotals {
  [key: string]: number;
}
