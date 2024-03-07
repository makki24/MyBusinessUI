import axios from "./NetworkInterceptor";
import { Tag } from "../types";

const TagsService = {
  getTags: async (): Promise<Tag[]> => {
    const response = await axios.get(`/api/tags`);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },

  addTag: async (tag: Tag) => {
    const response = await axios.post(`/api/tags`, tag);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },
};

export default TagsService;
