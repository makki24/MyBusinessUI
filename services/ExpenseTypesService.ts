import { apiUrl } from "../src/app-env.config";
import axios from "./NetworkInterceptor";
import { ExpenseType } from "../types";

const ExpenseTypesService = {
  getExpenseTypes: async () => {
    const response = await axios.get(`${apiUrl}/api/expenseTypes`);

    if (!response.data) {
      throw new Error(`Error fetching expense types: ${response.statusText}`);
    }

    return response.data;
  },

  addExpenseType: async (expenseTypeData: ExpenseType) => {
    const response = await axios.post(
      `${apiUrl}/api/expenseTypes`,
      expenseTypeData,
    );

    if (!response.data) {
      throw new Error(`Error adding expense type: ${response.statusText}`);
    }

    return response.data;
  },

  deleteExpenseType: async (id: string) => {
    await axios.delete(`${apiUrl}/api/expenseTypes/${id}`);
    // No response data for DELETE requests
    return null;
  },

  // Add other expense type-related API functions here
};

export default ExpenseTypesService;
