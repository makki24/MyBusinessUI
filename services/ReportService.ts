import axios from "./NetworkInterceptor";
import { ExpenseReport, Filter, UserReport } from "../types";
import { PricePerUnitAndTypeGroupedData } from "../src/components/report/types";

let getReportByUserRequest = null;

const ReportService = {
  getReport: async (filter: Filter): Promise<ExpenseReport> => {
    const response = await axios.post(`api/report/aggregateAmount`, filter);

    if (!response.data) {
      throw new Error(`No data in response.data`);
    }

    // Assuming the response.data is already in the format of ExpenseReport
    return response.data;
  },

  getGroupedReport: async (
    filter: Filter,
  ): Promise<PricePerUnitAndTypeGroupedData> => {
    const response = await axios.post(`api/report/byTag/grouped`, filter);

    if (!response.data) {
      throw new Error(`No data in response.data`);
    }

    // Assuming the response.data is already in the format of ExpenseReport
    return response.data;
  },

  getAmountNet: async () => {
    const response = await axios.get(`api/report/getAmountNet`);

    if (!response.data) {
      throw new Error(`No data in response.data`);
    }

    // Assuming the response.data is already in the format of ExpenseReport
    return response.data;
  },

  getExpenseSummaryByType: async (filter: Filter) => {
    const response = await axios.post(
      `api/report/expenseSummary/getTotalAmountByType`,
      filter,
    );

    if (!response.data) {
      throw new Error(`No data in response.data`);
    }

    // Assuming the response.data is already in the format of ExpenseReport
    return response.data;
  },

  getWorkSummaryByType: async (filter: Filter) => {
    const response = await axios.post(
      `api/report/workSummary/getTotalAmountByType`,
      filter,
    );

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

  downloadReport: async (filter): Promise<ExpenseReport> => {
    const response = await axios.post(`api/report/downloadReport`, filter);

    if (!response.data) {
      throw new Error(`No data in response.data`);
    }

    // Assuming the response.data is already in the format of ExpenseReport
    return response.data as ExpenseReport;
  },
};

export default ReportService;
