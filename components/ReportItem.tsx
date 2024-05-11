// src/components/ReportItem.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, Icon, useTheme } from "react-native-paper";
import { UserReport } from "../types";
import commonItemStyles from "../src/styles/commonItemStyles";
import commonStyles from "../src/styles/commonStyles";
import { REPORT_ICON_SIZE } from "../src/styles/constants";

interface ReportItemProps {
  reportData: UserReport;
}

const ReportItem: React.FC<ReportItemProps> = ({ reportData }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity>
      <Card style={commonItemStyles.card}>
        <Card.Content style={commonItemStyles.cardContent}>
          <View style={commonItemStyles.titleContainer}>
            <Title>{reportData.type}</Title>
            {(reportData.type === "Expense" ||
              reportData.type === "Contribution") && (
              <View>
                {reportData.sent ? (
                  <Icon
                    source="account-minus-outline"
                    color={theme.colors.secondary}
                    size={REPORT_ICON_SIZE}
                  />
                ) : (
                  <Icon
                    source="account-plus-outline"
                    color={theme.colors.primary}
                    size={REPORT_ICON_SIZE}
                  />
                )}
              </View>
            )}
            {reportData.type === "LoanClear" && (
              <View>
                <Icon
                  size={REPORT_ICON_SIZE}
                  source={"recycle-variant"}
                  color={theme.colors.primary}
                />
              </View>
            )}
          </View>
          <Paragraph>{`Date: ${reportData.date.toDateString()}`}</Paragraph>
          <Paragraph>{`Amount: ${reportData.amount}`}</Paragraph>
          {reportData.description && (
            <Paragraph>{`Description: ${reportData.description}`}</Paragraph>
          )}
          <View style={commonStyles.row}>
            <Paragraph>{`Amount H ${reportData.amountHolding}`}</Paragraph>
            <Paragraph>{`Amount R ${reportData.amountToReceive}`}</Paragraph>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

export default ReportItem;
