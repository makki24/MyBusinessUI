// src/components/ReportItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import {UserReport} from "../types";

interface ReportItemProps {
    reportData: UserReport;
}

const ReportItem: React.FC<ReportItemProps> = ({ reportData }) => {
    return (
        <TouchableOpacity>
            <Card style={styles.reportCard}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.titleContainer}>
                        <Title>{reportData.type}</Title>
                        { (reportData.type === 'Expense' || reportData.type === 'Contribution') &&
                            <Text>{reportData.sent ? 'Sent' : 'Received'}</Text>}
                    </View>
                    <Paragraph>{`Date: ${reportData.date.toDateString()}`}</Paragraph>
                    <Paragraph>{`Amount: ${reportData.amount}`}</Paragraph>
                    {reportData.description && <Paragraph>{`Description: ${reportData.description}`}</Paragraph>}
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    reportCard: {
        marginBottom: 16,
    },
    cardContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
});

export default ReportItem;
