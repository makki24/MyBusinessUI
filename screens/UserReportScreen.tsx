// src/screens/ReportScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import ReportItem from '../components/ReportItem';
import { userReportsState } from '../recoil/atom';
import { UserReport } from '../types';
import ReportService from "../services/ReportService";

const UserReportScreen = ({route}) => {
    const { userId } = route.params;
    const [reports, setReports] = useRecoilState(userReportsState);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchReports = async () => {
        try {
            setIsRefreshing(true);

            // Fetch reports data from your service or API
            // Replace the following line with your actual data fetching logic
            let reportsData = await ReportService.getReportByUser(userId);

            reportsData = reportsData.map(contribution => ({
                ...contribution,
                date: new Date(contribution.date)
            }))
            setReports(reportsData);
        } catch (error) {
            console.error('Error fetching reports:', error.message || 'Unknown error');
            setError(error.message || 'Error fetching reports. Please try again.');
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
        <View style={styles.container}>
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}

            {!error && (
                <FlatList
                    data={reports}
                    renderItem={({ item }) => (
                        <ReportItem
                            reportData={item}
                        />
                    )}
                    keyExtractor={(item) => item.date.toString()} // Assuming date is unique, ensure key is a string
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    errorContainer: {
        backgroundColor: 'red',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'white',
    },
});

export default UserReportScreen;
