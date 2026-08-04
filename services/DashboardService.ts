import axios from "./NetworkInterceptor";

export interface DashboardSummary {
  month: string;
  totalWorkAmount: number;
  totalExpenseAmount: number;
  totalContributionAmount: number;
  workCount: number;
  expenseCount: number;
  contributionCount: number;
}

export interface RecentActivity {
  id: number;
  type: "WORK" | "EXPENSE" | "CONTRIBUTION";
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
}

const DashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await axios.get("/api/dashboard/summary");
    if (!response.data) {
      throw new Error("No data in response");
    }
    return response.data;
  },

  getRecent: async (
    limit: number = 8,
    offset: number = 0,
  ): Promise<RecentActivity[]> => {
    const response = await axios.get(
      `/api/dashboard/recent?limit=${limit}&offset=${offset}`,
    );
    if (!response.data) {
      throw new Error("No data in response");
    }
    return response.data;
  },
};

export default DashboardService;
