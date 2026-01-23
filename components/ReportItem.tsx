// src/components/ReportItem.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Title, Paragraph, useTheme, Text } from "react-native-paper";
import { UserReport } from "../types";
import commonItemStyles from "../src/styles/commonItemStyles";
import commonStyles from "../src/styles/commonStyles";
import {
  ATTENDANCE_USER_RADIUS,
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
  amount: string;
  received: boolean;
}

const ReportItem: React.FC<ReportItemProps> = ({ reportData }) => {
  const theme = useTheme();
  // Derived state for better performance and correctness
  const received = !reportData.received;

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
        amount={received ? reportData.sent : reportData.received}
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
        received={!received}
      />
    </View>
  );
};

const CardItem: React.FC<CardItemProps> = ({
  reportData,
  style,
  amount,
  received,
}) => {
  return (
    <TouchableOpacity>
      <Card style={[styles.card, style]}>
        <Card.Content style={commonItemStyles.cardContent}>
          <View style={commonItemStyles.titleContainer}>
            <Title>{amount}</Title>
            {received && <Text>from {reportData.sender?.name}</Text>}
          </View>
          <View
            style={reportData.receiver?.name ? {} : { ...commonStyles.row }}
          >
            <Paragraph>
              {reportData.type}{" "}
              {reportData.receiver?.name
                ? `to ${reportData.receiver.name}`
                : ""}
            </Paragraph>
            <Paragraph>{`${reportData.date.toDateString()}`}</Paragraph>
          </View>
          {reportData.description && (
            <Paragraph>{`${reportData.description}`}</Paragraph>
          )}
          <View style={commonStyles.row}>
            <Paragraph>{`T S ${reportData.totalSent}`}</Paragraph>
            <Paragraph>{`T R ${reportData.totalReceived}`}</Paragraph>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
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
  card: {
    minWidth: "70%",
  },
  cardItemLeft: {
    borderTopLeftRadius: 0,
  },
  cardItemRight: {
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
