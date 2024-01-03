import axios from "./NetworkInterceptor";
import {ExpenseReport} from "../types/expenseReport";

const ReportService = {
    getReport: async (tagId: number): Promise<ExpenseReport> => {
        try {
            const response = await axios.get(`api/report/aggregateAmount`, {
                params: { tagId }, // Pass tagId as a query parameter
            });

            if (!response.data) {
                throw new Error(`No data in response.data`);
            }

            // Assuming the response.data is already in the format of ExpenseReport
            return response.data as ExpenseReport;
        } catch (error) {
            throw error; // You can handle the error further or let the caller handle it
        }
    },
};

export default ReportService;
