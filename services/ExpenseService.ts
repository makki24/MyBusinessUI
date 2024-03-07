// ExpenseService.ts
import axios from "./NetworkInterceptor"; // Adjust the path accordingly
import { Expense, Filter } from "../types";

const ExpenseService = {
  getExpenses: async () => {
    try {
      const response = await axios.get(`/api/expenses`);

      if (!response.data) {
        throw new Error(`Error fetching expenses: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addExpense: async (expenseData: Expense) => {
    try {
      console.log("expense", expenseData);
      const response = await axios.post(`/api/expenses`, expenseData);

      if (!response.data) {
        throw new Error(`Error adding expense: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteExpense: async (id: number) => {
    try {
      const response = await axios.delete(`/api/expenses/${id}`);

      // No response data for DELETE requests
      return null;
    } catch (error) {
      throw error;
    }
  },

  filterExpense: async (filter: Filter): Promise<Expense[]> => {
    try {
      const response = await axios.post(`/api/expenses/filter`, filter);

      if (!response.data) {
        throw new Error(`No data in response.data`);
      }

      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  // Add other expense-related API functions here
};

export default ExpenseService;
