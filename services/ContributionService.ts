import { Contribution, LoanToHoldingTransaction } from "../types";
import axios from "./NetworkInterceptor";

const ContributionService = {
  updateContribution: async (
    contribution: Contribution,
  ): Promise<Contribution> => {
    const response = await axios.post(`/api/contributions`, contribution);

    if (!response.data) {
      throw new Error(`no response.data`);
    }

    return response.data;
  },

  getContributions: async (): Promise<Contribution[]> => {
    const response = await axios.get(`/api/contributions`);

    if (!response.data) {
      throw new Error(`no response.data`);
    }

    return response.data;
  },

  deleteContribution: async (id: number): Promise<Contribution[]> => {
    const response = await axios.delete(`/api/contributions/${id}`);
    return response.data;
  },

  createOrUpdateLoanTransactions: async (
    transaction: LoanToHoldingTransaction,
  ): Promise<LoanToHoldingTransaction> => {
    const response = await axios.post(`/api/loan/clearLoan`, transaction);

    if (!response.data) {
      throw new Error(`no response.data`);
    }

    return response.data;
  },

  getLoanClearTransactions: async (): Promise<LoanToHoldingTransaction[]> => {
    const response = await axios.get(`/api/loan/clearLoan`);

    if (!response.data) {
      throw new Error(`no response.data`);
    }

    return response.data;
  },

  deleteLoanClearTransactions: async (
    id: number,
  ): Promise<LoanToHoldingTransaction> => {
    const response = await axios.delete(`/api/loan/clearLoan/${id}`);
    return response.data;
  },
};

export default ContributionService;
