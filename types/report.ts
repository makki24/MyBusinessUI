export interface ExpenseReport {
  totalWorkAmount: number;
  totalExpenseAmount: number;
  totalSaleAmount: number;
  totalContributionAmount: number;
}

export interface UserReport {
  date: Date;
  amount: number;
  type: string;
  description: string;
  sent: boolean;
  amountHolding: number;
  amountToReceive: number;
}
