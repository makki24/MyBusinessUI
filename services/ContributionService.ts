import {Contribution, LoanToHoldingTransaction} from "../types";
import axios from "./NetworkInterceptor";

const ContributionService = {

    updateContribution: async (contribution: Contribution): Promise<Contribution> => {
        try {
            const response = await axios.post(`/api/contributions`, contribution);

            if (!response.data) {
                throw new Error(`no response.data`);
            }

            return response.data;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    },

    getContributions: async (): Promise<Contribution[]> => {
        try {
            const response = await axios.get(`/api/contributions`);

            if (!response.data) {
                throw new Error(`no response.data`);
            }

            return response.data;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    },

    deleteContribution: async (id: number): Promise<Contribution[]> => {
        try {
            const response = await axios.delete(`/api/contributions/${id}`);

            return response.data;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    },

    createOrUpdateLoanTransactions: async (transaction: LoanToHoldingTransaction): Promise<LoanToHoldingTransaction> => {
        try {
            const response = await axios.post(`/api/loan/clearLoan`, transaction);

            if (!response.data) {
                throw new Error(`no response.data`);
            }

            return response.data;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    },

    getLoanClearTransactions: async (): Promise<LoanToHoldingTransaction[]> => {
        try {
            const response = await axios.get(`/api/loan/clearLoan`);

            if (!response.data) {
                throw new Error(`no response.data`);
            }

            return response.data;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    },

    deleteLoanClearTransactions: async (id: number): Promise<LoanToHoldingTransaction> => {
        try {
            const response = await axios.delete(`/api/loan/clearLoan/${id}`);

            return response.data;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    }

}

export default ContributionService;