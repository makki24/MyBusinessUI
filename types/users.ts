import { Role } from "./roles";

export interface User {
  name: string;
  picture: string;
  email: string;
  phoneNumber: string;
  amountToReceive: number;
  amountHolding: number;
  id?: string;
  roles: Role[]; // Assuming you have a Role interface defined

  // Add other methods or properties if needed
}
