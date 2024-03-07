import axios from "./NetworkInterceptor";
import { apiUrl } from "../app-env.config";
import { User } from "../types";

const UserService = {
  getUsers: async () => {
    const response = await axios.get(`/api/users`);

    if (!response.data) {
      throw new Error(`Error fetching roles: ${response.statusText}`);
    }

    return response.data;
  },

  assignUserToRole: async (userId, roleId) => {
    const response = await axios.post(`${apiUrl}/api/assign/add-role`, {
      userId,
      roleId,
    });

    if (!response.data) {
      throw new Error(`Error assigning role: ${response.statusText}`);
    }

    return response.data;
  },

  removeUserRole: async (userId, roleId) => {
    const response = await axios.post(`${apiUrl}/api/assign/remove-role`, {
      userId,
      roleId,
    });

    if (!response.data) {
      throw new Error(`Error removing role: ${response.statusText}`);
    }

    return response.data;
  },

  addUser: async (user: User): Promise<User> => {
    const response = await axios.post(`/api/users`, user);

    if (!response.data) {
      throw new Error(`No data in response.data`);
    }

    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await axios.delete(`/api/users/${id}`);
    return response.data;
  },
};

export default UserService;
