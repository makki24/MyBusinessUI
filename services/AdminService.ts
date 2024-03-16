import axios from "./NetworkInterceptor";
import { User } from "../types";
import saveToken from "../src/util/SaveToken";

const AdminService = {
  upload: async () => {
    const response = await axios.get(`/api/uploadToDrive`);
    return response.data;
  },

  restore: async () => {
    const response = await axios.get(`/api/uploadToDrive/restore`);
    return response.data;
  },

  impersonate: async (user: User) => {
    const userResponse = await axios.post(`/impersonate`, user);
    saveToken(userResponse);
    return userResponse.data;
  },
  // Add other expense-related API functions here
};

export default AdminService;
