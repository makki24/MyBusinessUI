import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import {Button, Card, Title, Paragraph, Divider, Icon} from 'react-native-paper';

import { tagsState } from '../recoil/atom';
import CustomDropDown from '../components/common/CustomDropdown';
import { useRecoilState } from 'recoil';
import ReportService from '../services/ReportService';
import { ExpenseReport } from '../types/expenseReport';

const ReportScreen = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [tagOpen, setTagOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState<number>(null);
    const [tags, setTags] = useRecoilState(tagsState);
    const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
    const [report, setReport] = useState<ExpenseReport>(null);
    const [profitOrLoss, setProfitOrLoss] = useState<number>();

    const generateReport = async () => {
        setError('');
        setIsLoading(true);

        try {
            const reportsRes = await ReportService.getReport(selectedTags);
            setProfitOrLoss((reportsRes.totalSaleAmount + reportsRes.totalContributionAmount) - (reportsRes.totalExpenseAmount + reportsRes.totalWorkAmount));
            setReport(reportsRes);
        } catch (err) {
            console.error('Error generating report:', err);
            setError(err.message ?? 'An error occurred while generating the report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateReport = () => {
        if (!selectedTags) {
            setError('Please select a tag first');
            return;
        }

        generateReport();
    };

    return (
        <View style={styles.viewContainer}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <CustomDropDown
                    items={tags}
                    zIndex={1000}
                    zIndexInverse={1000}
                    schema={{
                        label: 'tagName',
                        value: 'id',
                    }}
                    open={tagOpen}
                    setOpen={setTagOpen}
                    containerStyle={{ height: 40, marginBottom: 16 }}
                    value={selectedTags}
                    setValue={setSelectedTags}
                    itemSeparator={true}
                    placeholder="Select Tags"
                    loading={isDataLoading}
                />

                <Button mode="contained" onPress={handleGenerateReport}>
                    See Report
                </Button>

                {report && (
                    <Card style={styles.reportCard}>
                        <Card.Content>
                            <Title>Expense Report</Title>
                            <Paragraph>Total Work Amount: {report.totalWorkAmount}</Paragraph>
                            <Paragraph>Total Expense Amount: {report.totalExpenseAmount}</Paragraph>
                            <Paragraph>Total Sale Amount: {report.totalSaleAmount}</Paragraph>
                            <Paragraph>Total Contribution: {report.totalContributionAmount}</Paragraph>
                            <Divider />
                            <View style={styles.profitOrLossContainer}>
                                <View style={[styles.profitOrLossIcon, profitOrLoss <= 0 && styles.hidden]}>
                                    <Icon source="arrow-up-bold-circle" color="green" size={20} />
                                </View>
                                <View style={[styles.profitOrLossIcon, profitOrLoss > 0 && styles.hidden]}>
                                    <Icon source="arrow-down-bold-circle" color="red" size={20} />
                                </View>
                                <Paragraph style={styles.profitOrLossText}>
                                    {profitOrLoss > 0 ? (
                                        <>Profit: {profitOrLoss}</>
                                    ) : (
                                        <>Loss: {Math.abs(profitOrLoss)}</>
                                    )}
                                </Paragraph>
                            </View>
                        </Card.Content>
                    </Card>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    viewContainer: {
        flex: 1, // Ensure the container takes the full screen height
        justifyContent: 'center',
        padding: 16,
    },
    scrollViewContent: {
        flexGrow: 1, // Allow the content to grow within the ScrollView
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
    reportCard: {
        marginTop: 10,
        marginHorizontal: 10,
        borderRadius: 10,
        elevation: 3,
    },
    profitOrLossContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profitOrLossIcon: {
        marginRight: 5,
    },
    profitOrLossText: {
        fontWeight: 'bold',
    },
    hidden: {
        display: 'none',
    },
});

export default ReportScreen;