import { apiUrl } from "../src/app-env.config";
import axios from "./NetworkInterceptor";
import { Role } from "../types";

const RolesService = {
  getRoles: async () => {
    const response = await axios.get(`${apiUrl}/api/roles`);

    if (!response.data) {
      throw new Error(`Error fetching roles: ${response.statusText}`);
    }

    return response.data;
  },

  addRole: async (roleData: Role) => {
    const response = await axios.post(`${apiUrl}/api/roles`, roleData);

    if (!response.data) {
      throw new Error(`Error adding roles: ${response.statusText}`);
    }

    return response.data;
  },

  getUsersAssigned: async (id: string) => {
    const response = await axios.get(`${apiUrl}/api/users/byRole/${id}`);

    if (!response.data) {
      throw new Error(`Error getting users: ${response.statusText}`);
    }

    return response.data;
  },

  deleteRole: async (id: string) => {
    await axios.delete(`${apiUrl}/api/roles/${id}`);
    // No response data for DELETE requests
    return null;
  },

  // Add other role-related API functions here
};

export default RolesService;
