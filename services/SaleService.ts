import { Sale } from "../types";
import axios from "./NetworkInterceptor";

const SaleService = {
  getSales: async (): Promise<Sale[]> => {
    const response = await axios.get(`/api/sales`);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },

  addSale: async (type: Sale): Promise<Sale> => {
    const response = await axios.post(`/api/sales`, type);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },

  deleteSale: async (id: number): Promise<void> => {
    await axios.delete(`/api/sales/${id}`);
  },
};

export default SaleService;
