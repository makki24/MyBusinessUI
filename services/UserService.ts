import axios from "./NetworkInterceptor";
import {apiUrl} from "../app-env.config";
import {Contribution, User} from "../types";

const UserService = {
    getUsers: async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/users`);

            if (!response.data) {
                throw new Error(`Error fetching roles: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    },

    assignUserToRole: async (userId, roleId) => {
        try {
            const response = await axios.post(`${apiUrl}/api/assign/add-role`, {
                userId,
                roleId,
            });

            if (!response.data) {
                throw new Error(`Error assigning role: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    },

    removeUserRole: async (userId, roleId) => {
        try {
            const response = await axios.post(`${apiUrl}/api/assign/remove-role`, {
                userId,
                roleId,
            });

            if (!response.data) {
                throw new Error(`Error removing role: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    },

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

    updateLoan: async (user: User) => {
        try {
            const response = await axios.put(`${apiUrl}/api/users/updateLoan`, user);

            if (!response.data) {
                throw new Error(`Error removing role: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    },

}

export default UserService;