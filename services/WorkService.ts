import axios from "./NetworkInterceptor";
import { FilterAndSort, Work, WorkType } from "../types";

const WorkService = {
  getWorkTypes: async (): Promise<WorkType[]> => {
    const response = await axios.get(`/api/work-types`);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },

  addWorkType: async (type: WorkType) => {
    const response = await axios.post(`/api/work-types`, type);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },

  deleteWorkType: async (id: number) => {
    const response = await axios.delete(`/api/work-types/${id}`);
    return response.data;
  },

  getWorks: async (): Promise<Work[]> => {
    const response = await axios.get(`/api/works`);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },

  addWork: async (work: Work) => {
    const response = await axios.post(`/api/works`, work);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },

  deleteWork: async (id: number) => {
    const response = await axios.delete(`/api/works/${id}`);
    return response.data;
  },

  filterWork: async (filter: FilterAndSort): Promise<Work[]> => {
    const response = await axios.post(`/api/works/filter`, filter);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },
};

export default WorkService;
