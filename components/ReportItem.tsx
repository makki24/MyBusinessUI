// src/components/ReportItem.tsx
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Title, Paragraph, Icon, useTheme } from "react-native-paper";
import { UserReport } from "../types";
import commonItemStyles from "../src/styles/commonItemStyles";
import commonStyles from "../src/styles/commonStyles";
import {
  ATTENDANCE_USER_RADIUS,
  REPORT_ICON_SIZE,
  UI_ELEMENTS_GAP,
} from "../src/styles/constants";
import ProfilePicture from "../src/components/common/ProfilePicture";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

interface ReportItemProps {
  reportData: UserReport;
}

interface CardItemProps {
  reportData: UserReport;
  style: StyleProp<ViewStyle>;
}

const CardItem: React.FC<CardItemProps> = ({ reportData, style }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity>
      <Card style={style}>
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

const ReportItem: React.FC<ReportItemProps> = ({ reportData }) => {
  const theme = useTheme();
  const [received, setIsReceived] = useState(false);

  useEffect(() => {
    if (
      (reportData.type === "Expense" || reportData.type === "Contribution") &&
      reportData.sent
    )
      setIsReceived(true);
    if (reportData.type === "Work") setIsReceived(true);
  }, []);

  return (
    <View style={received ? styles.cardLeft : styles.cardRight}>
      {!received && (
        <ProfilePicture
          size={40}
          style={received ? styles.userImageLeft : styles.userImageRight}
          picture={reportData.sender?.picture}
        />
      )}
      <CardItem
        reportData={reportData}
        style={
          received
            ? {
                ...styles.cardItemLeft,
                backgroundColor: theme.colors.background,
              }
            : {
                ...styles.cardItemRight,
                backgroundColor: theme.colors.primaryContainer,
              }
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  userImageLeft: {
    borderRadius: ATTENDANCE_USER_RADIUS,
    marginRight: UI_ELEMENTS_GAP / 2,
  },
  userImageRight: {
    borderRadius: ATTENDANCE_USER_RADIUS,
    marginLeft: UI_ELEMENTS_GAP / 2,
  },
  cardItemLeft: {
    marginBottom: UI_ELEMENTS_GAP,
    borderTopLeftRadius: 0,
  },
  cardItemRight: {
    marginBottom: UI_ELEMENTS_GAP,
    borderTopRightRadius: 0,
  },
  cardLeft: {
    marginBottom: UI_ELEMENTS_GAP,
    flexDirection: "row",
  },
  cardRight: {
    marginBottom: UI_ELEMENTS_GAP,
    flexDirection: "row-reverse",
  },
});

export default ReportItem;
