import axios from "../../../services/NetworkInterceptor";

const DashBoardService = {
  getLineGraph: async () => {
    const response = await axios.get(`/api/charts/getLineGraph`);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },
};

export default DashBoardService;
