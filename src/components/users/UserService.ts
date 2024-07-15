import axios from "../../../services/NetworkInterceptor";
import { ReportSummaryModel } from "./report-summary.model";

const UserService = {
  sendSummaryToMail: async (payload: ReportSummaryModel) => {
    const response = await axios.post(`/api/report/sendSummaryToMail`, payload);

    if (!response.data) {
      throw new Error(`Error fetching roles: ${response.statusText}`);
    }

    return response.data;
  },
};

export default UserService;
