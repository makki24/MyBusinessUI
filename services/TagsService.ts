import axios from "./NetworkInterceptor";
import { Tag } from "../types";

const TagsService = {
  getTags: async (): Promise<Tag[]> => {
    try {
      const response = await axios.get(`/api/tags`);
      if (!response.data) {
        throw new Error(`No data in response.data`);
      }
      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },

  addTag: async (tag: Tag) => {
    try {
      const response = await axios.post(`/api/tags`, tag);

      if (!response.data) {
        throw new Error(`No data in response.data`);
      }

      return response.data;
    } catch (error) {
      throw error; // You can handle the error further or let the caller handle it
    }
  },
};

export default TagsService;
