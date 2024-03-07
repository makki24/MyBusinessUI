// ExpenseTypesService.ts
import { apiUrl } from "../app-env.config";
import axios from "./NetworkInterceptor";
import { ExpenseType } from "../types"; // Adjust the path accordingly

const ExpenseTypesService = {
  getExpenseTypes: async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/expenseTypes`);

      if (!response.data) {
        throw new Error(`Error fetching expense types: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  addExpenseType: async (expenseTypeData: ExpenseType) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/expenseTypes`,
        expenseTypeData,
      );

      if (!response.data) {
        console.log("before throw", response);
        throw new Error(`Error adding expense type: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteExpenseType: async (id: any) => {
    try {
      const response = await axios.delete(`${apiUrl}/api/expenseTypes/${id}`);

      // No response data for DELETE requests
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Add other expense type-related API functions here
};

export default ExpenseTypesService;
