// src/screens/ReportScreen.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { useRecoilState } from "recoil";
import ReportItem from "../components/ReportItem";
import { userReportsState } from "../recoil/atom";
import ReportService from "../services/ReportService";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

interface UserReportScreenProps {
  navigation: NavigationProp<ParamListBase>;
  route: {
    params: {
      userId: number;
    };
  };
}

const UserReportScreen: React.FC<UserReportScreenProps> = ({ route }) => {
  const { userId } = route.params;
  const [reports, setReports] = useRecoilState(userReportsState);
  const [error, setError] = useState(null);
  const [isLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      setIsRefreshing(true);

      // Fetch reports data from your service or API
      // Replace the following line with your actual data fetching logic
      let reportsData = await ReportService.getReportByUser(userId);

      reportsData = reportsData.map((contribution) => ({
        ...contribution,
        date: new Date(contribution.date),
      }));
      setReports(reportsData);
    } catch (error) {
      setError(error.message || "Error fetching reports. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRefresh = () => {
    fetchReports();
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />

      {!error && (
        <FlatList
          data={reports}
          renderItem={({ item }) => <ReportItem reportData={item} />}
          keyExtractor={(item) => item.date.toString()} // Assuming date is unique, ensure key is a string
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}
    </View>
  );
};

export default UserReportScreen;
