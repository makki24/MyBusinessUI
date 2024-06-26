import axios from "./NetworkInterceptor";
import { ExpenseReport, UserReport } from "../types";

let getReportByUserRequest = null;

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

  getReportByUser: async (
    userId: number,
    offset,
    limit,
  ): Promise<UserReport[]> => {
    if (getReportByUserRequest) {
      getReportByUserRequest.cancel();
    }

    getReportByUserRequest = axios.CancelToken.source();
    let response;

    try {
      response = await axios.get(`api/report/getReportByUser`, {
        params: { userId, offset, limit },
        cancelToken: getReportByUserRequest.token,
      });
    } catch (err) {
      if (axios.isCancel(err)) {
        return [];
      } else throw err;
    }

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
