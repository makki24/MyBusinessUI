import axios from "../../../services/NetworkInterceptor";

const DashBoardService = {
  getLineGraph: async (inputDate: Date) => {
    const response = await axios.post(`/api/charts/getLineGraph`, inputDate);
    if (!response.data) {
      throw new Error(`No data in response.data`);
    }
    return response.data;
  },
};

export default DashBoardService;
