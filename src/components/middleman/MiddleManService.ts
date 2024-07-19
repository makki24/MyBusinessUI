import axios from "../../../services/NetworkInterceptor";
import { FilterAndSort, WorkAndSale } from "../../../types";

const MiddleManService = {
  createWorksAndSales: async (works: WorkAndSale) => {
    const response = await axios.post(`/api/middleMan`, works);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },

  getWorksAndSales: async (filter: FilterAndSort): Promise<WorkAndSale[]> => {
    const response = await axios.post(`/api/middleMan/filter`, filter);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },
};

export default MiddleManService;
