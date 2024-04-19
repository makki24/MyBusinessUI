import axios from "./NetworkInterceptor";
import { User } from "../types";
import saveToken from "../src/util/SaveToken";
import { DriveFile } from "../types/upload";

const AdminService = {
  upload: async () => {
    const response = await axios.get(`/api/uploadToDrive`);
    return response.data;
  },

  restore: async (driveFile: DriveFile) => {
    const response = await axios.post(`/api/uploadToDrive/restore`, driveFile);
    return response.data;
  },

  impersonate: async (user: User) => {
    const userResponse = await axios.post(`/impersonate`, user);
    saveToken(userResponse);
    return userResponse.data;
  },

  listFiles: async (): Promise<DriveFile[]> => {
    const response = await axios.get(`/api/uploadToDrive/getFiles`);
    return response.data;
  },

  // Add other expense-related API functions here
};

export default AdminService;
