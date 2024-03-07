import axios from "./NetworkInterceptor";
import { ExpenseReport, UserReport } from "../types";

const ReportService = {
  getReport: async (tagId: number): Promise<ExpenseReport> => {
    try {
      const response = await axios.get(`api/report/aggregateAmount`, {
        params: { tagId }, // Pass tagId as a query parameter
      });

      if (!response.data) {
        throw new Error(`No data in response.data`);
      }

      // Assuming the response.data is already in the format of ExpenseReport
      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  getReportByUser: async (userId: number): Promise<UserReport[]> => {
    try {
      const response = await axios.get(`api/report/getReportByUser`, {
        params: { userId },
      });

      if (!response.data) {
        throw new Error(`No data in response.data`);
      }

      // Assuming the response.data is already in the format of ExpenseReport
      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  downloadReport: async (tagId: number): Promise<ExpenseReport> => {
    try {
      const response = await axios.get(`api/report/downloadReport`, {
        params: { tagId }, // Pass tagId as a query parameter
      });

      if (!response.data) {
        throw new Error(`No data in response.data`);
      }

      // Assuming the response.data is already in the format of ExpenseReport
      return response.data as ExpenseReport;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },
};

export default ReportService;
