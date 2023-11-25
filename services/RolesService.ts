// RolesService.ts
import { apiUrl } from '../app-env.config';
import axios from './NetworkInterceptor';// Adjust the path accordingly



const RolesService = {
    getRoles: async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/roles`);

            if (!response.data) {
                throw new Error(`Error fetching roles: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    },

    addRole: async (roleData: any) => {
        try {
            const response = await axios.post(`${apiUrl}/api/roles`, roleData);

            if (!response.data) {
                throw new Error(`Error adding roles: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getUsersAssigned: async (id: any) => {
        try {
            const response = await axios.get(`${apiUrl}/api/users/byRole/${id}`);

            if (!response.data) {
                throw new Error(`Error getting users: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteRole: async (id: any) => {
        try {
            const response = await axios.delete(`${apiUrl}/api/roles/${id}`);

            // No response data for DELETE requests
            return null;
        } catch (error) {
            throw error;
        }
    },

    // Add other role-related API functions here
};

export default RolesService;
