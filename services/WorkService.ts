import axios from "./NetworkInterceptor";
import { Filter, Work, WorkType } from "../types";

const WorkService = {
  getWorkTypes: async (): Promise<WorkType[]> => {
    try {
      const response = await axios.get(`/api/work-types`);
      if (!response.data) {
        throw new Error(`No data in response.data`);
      }
      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  addWorkType: async (type: WorkType) => {
    try {
      const response = await axios.post(`/api/work-types`, type);

      if (!response.data) {
        throw new Error(`No data in response.data`);
      }

      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  deleteWorkType: async (id: number) => {
    try {
      const response = await axios.delete(`/api/work-types/${id}`);
      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  getWorks: async (): Promise<Work[]> => {
    try {
      const response = await axios.get(`/api/works`);
      if (!response.data) {
        throw new Error(`No data in response.data`);
      }
      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  addWork: async (work: Work) => {
    try {
      const response = await axios.post(`/api/works`, work);

      if (!response.data) {
        throw new Error(`No data in response.data`);
      }

      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  deleteWork: async (id: number) => {
    try {
      const response = await axios.delete(`/api/works/${id}`);
      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  filterWork: async (filter: Filter): Promise<Work[]> => {
    try {
      const response = await axios.post(`/api/works/filter`, filter);

      if (!response.data) {
        throw new Error(`No data in response.data`);
      }

      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },
};

export default WorkService;
