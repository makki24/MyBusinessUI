import axios from "./NetworkInterceptor";
import {Filter} from "../types";

const FilterService = {
    applyFilter: async (filter: Filter): Promise<any[]> => {
        try {
            const response = await axios.post(`/api/applyFilter`, filter);
            if (!response.data) {
                throw new Error(`No data in response.data`);
            }
            return response.data;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    },
}

export default FilterService;