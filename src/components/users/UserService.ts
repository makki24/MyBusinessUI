import axios from "../../../services/NetworkInterceptor";
import { ReportSummaryModel, UserSummaryByType } from "./report-summary.model";

const UserService = {
  sendSummaryToMail: async (payload: ReportSummaryModel) => {
    const response = await axios.post(`/api/report/sendSummaryToMail`, payload);

    if (!response.data) {
      throw new Error(`Error fetching roles: ${response.statusText}`);
    }

    return response.data;
  },

  getSummaryByUser: async (
    payload: ReportSummaryModel,
  ): Promise<{ sent: UserSummaryByType[]; received: UserSummaryByType[] }> => {
    const response = await axios.post(`api/report/getUserSummary`, payload);

    if (!response.data) {
      throw new Error(`No data in response.data`);
    }

    // Assuming the response.data is already in the format of ExpenseReport
    return response.data;
  },
};

export default UserService;
