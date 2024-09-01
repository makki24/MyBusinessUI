import { Role } from "./roles";
import { WorkType } from "./work";

export interface UserWorkTypePrice {
  id?: number;
  unit: string;
  type: WorkType;
  pricePerUnit?: number;
}

interface UserProperties {
  user?: User;
  isOwnAsset: boolean;
  isOwnLiability: boolean;
  workTypePrices: UserWorkTypePrice[];
}

export interface User {
  name: string;
  picture: string;
  email: string;
  phoneNumber: string;
  amountToReceive: number;
  amountHolding: number;
  userProperties: UserProperties;
  id?: string;
  roles: Role[]; // Assuming you have a Role interface defined
  notificationToken?: string;
  // Add other methods or properties if needed
}
