import { FilterAndSort, Sale } from "../types";
import axios from "./NetworkInterceptor";

let filterSaleRequest = null;

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

  filterSale: async (filter: FilterAndSort): Promise<Sale[]> => {
    if (filterSaleRequest) {
      filterSaleRequest.cancel();
    }

    // creates a new token for upcomming ajax (overwrite the previous one)
    filterSaleRequest = axios.CancelToken.source();
    let response;

    try {
      response = await axios.post(`/api/sales/filter`, filter, {
        cancelToken: filterSaleRequest.token,
      });
    } catch (err) {
      if (axios.isCancel(err)) {
        return [];
      } else throw err;
    }

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
