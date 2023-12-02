// ExpenseService.ts
import { apiUrl } from '../app-env.config';
import axios from './NetworkInterceptor'; // Adjust the path accordingly
import { Expense } from '../types';

const ExpenseService = {
    getExpenses: async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/expenses`);

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
            console.log('expense', expenseData);
            const response = await axios.post(`${apiUrl}/api/expenses`, expenseData);

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
            const response = await axios.delete(`${apiUrl}/api/expenses/${id}`);

            // No response data for DELETE requests
            return null;
        } catch (error) {
            throw error;
        }
    },

    // Add other expense-related API functions here
};

export default ExpenseService;
