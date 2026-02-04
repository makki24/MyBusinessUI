import axios from "../../../services/NetworkInterceptor";

export interface DashboardStats {
  totalToPay: number;
  totalToReceive: number;
  netBalance: number;
  activeUsers: number;
  lastUpdated: Date;
}

export interface UserChartRequest {
  userId: number;
  fromDate: Date;
}

const DashBoardService = {
  getLineGraph: async (inputDate: Date) => {
    const response = await axios.post(`/api/charts/getLineGraph`, inputDate);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },

  getLineGraphByUser: async (userId: number, fromDate: Date) => {
    const response = await axios.post(`/api/charts/getLineGraphByUser`, {
      userId,
      fromDate,
    });
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await axios.get(`/api/charts/getDashboardStats`);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },
};

export default DashBoardService;
