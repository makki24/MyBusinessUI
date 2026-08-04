import axios from "./NetworkInterceptor";

export interface WorkTypeBalance {
  workTypeId: number;
  workTypeName: string;
  unit: string;
  totalWorkAmount: number;
  totalWorkQty: number;
  advancePaid: number;
  adhocPaid: number;
  settlementPaid: number;
  untaggedPaid: number;
  totalPaid: number;
  netBalance: number;
}

export interface UserBalance {
  netBalance: number;
  workTypeBalances: WorkTypeBalance[];
  untaggedPayments: number;
  expensesSent: number;
  sales: number;
  contributionsSent: number;
  contributionsReceived: number;
}

const BalanceService = {
  getUserBalance: async (userId: string | number): Promise<UserBalance> => {
    const response = await axios.get(`/api/users/${userId}/balance`);
    if (!response.data) {
      throw new Error("No data in response");
    }
    return response.data;
  },
};

export default BalanceService;
