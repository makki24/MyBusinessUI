import axios from "./NetworkInterceptor";
import { ExpenseReport, UserReport } from "../types";

const ReportService = {
  getReport: async (
    tagId: number,
    excludeTagId: number,
  ): Promise<ExpenseReport> => {
    const response = await axios.get(`api/report/aggregateAmount`, {
      params: { tagId, excludeTagId }, // Pass tagId as a query parameter
    });

    if (!response.data) {
      throw new Error(`No data in response.data`);
    }

    // Assuming the response.data is already in the format of ExpenseReport
    return response.data;
  },

  getReportByUser: async (userId: number): Promise<UserReport[]> => {
    const response = await axios.get(`api/report/getReportByUser`, {
      params: { userId },
    });

    if (!response.data) {
      throw new Error(`No data in response.data`);
    }

    // Assuming the response.data is already in the format of ExpenseReport
    return response.data;
  },

  downloadReport: async (
    tagId: number,
    excludeTagId: number,
  ): Promise<ExpenseReport> => {
    const response = await axios.get(`api/report/downloadReport`, {
      params: { tagId, excludeTagId }, // Pass tagId as a query parameter
    });

    if (!response.data) {
      throw new Error(`No data in response.data`);
    }

    // Assuming the response.data is already in the format of ExpenseReport
    return response.data as ExpenseReport;
  },
};

export default ReportService;
