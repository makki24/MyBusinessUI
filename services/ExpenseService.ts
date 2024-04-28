import axios from "./NetworkInterceptor";
import { Expense, FilterAndSort } from "../types";

let filterExpenseRequest = null;

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
    if (filterExpenseRequest) {
      filterExpenseRequest.cancel();
    }

    // creates a new token for upcomming ajax (overwrite the previous one)
    filterExpenseRequest = axios.CancelToken.source();
    let response;

    try {
      response = await axios.post(`/api/expenses/filter`, filter, {
        cancelToken: filterExpenseRequest.token,
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

  // Add other expense-related API functions here
};

export default ExpenseService;
