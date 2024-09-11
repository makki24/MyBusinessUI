import axios from "../../services/NetworkInterceptor";
import { Filter } from "../../types";

const FilterService = {
  getExpenseFilters: async (): Promise<Filter> => {
    const response = await axios.get(`/api/expenses/filter/getExpenseFilters`);

    if (!response.data) {
      throw new Error(`Error fetching expenses: ${response.statusText}`);
    }

    return response.data;
  },

  getSaleFilters: async (): Promise<Filter> => {
    const response = await axios.get(`/api/sales/filter/getSaleFilters`);

    if (!response.data) {
      throw new Error(`Error fetching expenses: ${response.statusText}`);
    }

    return response.data;
  },

  getWorkFilters: async (): Promise<Filter> => {
    const response = await axios.get(`/api/works/filter/getWorkFilters`);

    if (!response.data) {
      throw new Error(`Error fetching expenses: ${response.statusText}`);
    }

    return response.data;
  },

  getContributionFilters: async (): Promise<Filter> => {
    const response = await axios.get(
      `/api/contributions/filter/getContributionFilters`,
    );

    if (!response.data) {
      throw new Error(`Error fetching contributions: ${response.statusText}`);
    }

    return response.data;
  },
};

export default FilterService;
