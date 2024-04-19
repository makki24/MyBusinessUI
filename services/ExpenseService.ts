import axios from "./NetworkInterceptor";
import { Expense, FilterAndSort } from "../types";

const ExpenseService = {
  getExpenses: async () => {
    const response = await axios.get(`/api/expenses`);

    if (!response.data) {
      throw new Error(`Error fetching expenses: ${response.statusText}`);
    }

    return response.data;
  },

  addExpense: async (expenseData: Expense) => {
    const response = await axios.post(`/api/expenses`, expenseData);

    if (!response.data) {
      throw new Error(`Error adding expense: ${response.statusText}`);
    }

    return response.data;
  },

  deleteExpense: async (id: number) => {
    await axios.delete(`/api/expenses/${id}`);
    // No response data for DELETE requests
    return null;
  },

  filterExpense: async (filter: FilterAndSort): Promise<Expense[]> => {
    const response = await axios.post(`/api/expenses/filter`, filter);

    if (!response.data) {
      throw new Error(`No data in response.data`);
    }

    return response.data;
  },

  // Add other expense-related API functions here
};

export default ExpenseService;
