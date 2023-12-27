import {Contribution} from "../types";
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

}

export default ContributionService;