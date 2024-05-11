import axios from "../../../services/NetworkInterceptor";
import { Work } from "../../../types";

const AttendanceService = {
  createWorks: async (works: Work[]) => {
    const response = await axios.post(`/api/works/createWorks`, works);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },
};

export default AttendanceService;
