import { Sale, WorkType } from "../types";
import axios from "./NetworkInterceptor";

const SaleService = {
  getSales: async (): Promise<Sale[]> => {
    try {
      const response = await axios.get(`/api/sales`);
      if (!response.data) {
        throw new Error(`No data in response.data`);
      }
      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  addSale: async (type: Sale): Promise<Sale> => {
    try {
      const response = await axios.post(`/api/sales`, type);

      if (!response.data) {
        throw new Error(`No data in response.data`);
      }

      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  deleteSale: async (id: number): Promise<void> => {
    try {
      const response = await axios.delete(`/api/sales/${id}`);
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },
};

export default SaleService;
