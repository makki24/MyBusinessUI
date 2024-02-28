// src/components/ReportItem.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import {Card, Title, Paragraph, Chip, Icon, MD3Colors} from 'react-native-paper';
import {UserReport} from "../types";
import commonItemStyles from "../src/styles/commonItemStyles";

interface ReportItemProps {
    reportData: UserReport;
}

const ReportItem: React.FC<ReportItemProps> = ({ reportData }) => {
    return (
        <TouchableOpacity>
            <Card style={commonItemStyles.card}>
                <Card.Content style={commonItemStyles.cardContent}>
                    <View style={commonItemStyles.titleContainer}>
                        <Title>{reportData.type}</Title>
                        { (reportData.type === 'Expense' || reportData.type === 'Contribution') &&
                            <View>
                                {reportData.sent ? (
                                    <Icon
                                        source="account-minus-outline"
                                        color={MD3Colors.secondary50}
                                        size={35}
                                    />) :
                                    (<Icon
                                    source="account-plus-outline"
                                    color={MD3Colors.primary50}
                                    size={35} />)
                            }</View>}
                    </View>
                    <Paragraph>{`Date: ${reportData.date.toDateString()}`}</Paragraph>
                    <Paragraph>{`Amount: ${reportData.amount}`}</Paragraph>
                    {reportData.description && <Paragraph>{`Description: ${reportData.description}`}</Paragraph>}
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
};

export default ReportItem;
