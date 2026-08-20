// src/components/ReportItem.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Card, useTheme, Text } from "react-native-paper";
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
  hideBalance?: boolean;
  bottomText?: string;
  bottomValue?: number;
  hideBottomSection?: boolean;
  bottomValueColor?: string;
  alwaysShowSender?: boolean;
}

interface CardItemProps {
  reportData: UserReport;
  style: StyleProp<ViewStyle>;
  amount: string;
  received: boolean;
  hideBalance?: boolean;
  bottomText?: string;
  bottomValue?: number;
  hideBottomSection?: boolean;
  bottomValueColor?: string;
  alwaysShowSender?: boolean;
}

const ReportItem: React.FC<ReportItemProps> = ({
  reportData,
  hideBalance,
  bottomText,
  bottomValue,
  hideBottomSection,
  bottomValueColor,
  alwaysShowSender,
}) => {
  const theme = useTheme();
  // Derived state for better performance and correctness
  const received = !reportData.received;

  return (
    <View style={received ? styles.cardLeft : styles.cardRight}>
      {(!received || alwaysShowSender) && (
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
        hideBalance={hideBalance}
        bottomText={bottomText}
        bottomValue={bottomValue}
        hideBottomSection={hideBottomSection}
        bottomValueColor={bottomValueColor}
        alwaysShowSender={alwaysShowSender}
      />
    </View>
  );
};

const CardItem: React.FC<CardItemProps> = ({
  reportData,
  style,
  amount,
  received,
  hideBalance,
  bottomText,
  bottomValue,
  hideBottomSection,
  bottomValueColor,
  alwaysShowSender,
}) => {
  const theme = useTheme();
  return (
    <TouchableOpacity>
      <Card style={[styles.card, style]}>
        <Card.Content style={commonItemStyles.cardContent}>
          <View style={commonItemStyles.titleContainer}>
            <Text variant="titleMedium">{amount}</Text>
            {(received || alwaysShowSender) && reportData.sender?.name && (
              <Text>from {reportData.sender?.name}</Text>
            )}
          </View>
          <View
            style={reportData.receiver?.name ? {} : { ...commonStyles.row }}
          >
            <Text variant="bodyMedium">
              {reportData.type}{" "}
              {reportData.receiver?.name
                ? `to ${reportData.receiver.name}`
                : ""}
            </Text>
            <Text variant="bodyMedium">{`${reportData.date.toDateString()}`}</Text>
          </View>
          {reportData.description && (
            <Text variant="bodyMedium">{`${reportData.description}`}</Text>
          )}
          {!hideBalance && (
            <View style={commonStyles.row}>
              <Text variant="bodyMedium">{`T S ${reportData.totalSent}`}</Text>
              <Text variant="bodyMedium">{`T R ${reportData.totalReceived}`}</Text>
            </View>
          )}

          {!hideBottomSection && (
            <View style={styles.balanceContainer}>
              <Text variant="bodyMedium" style={styles.balanceLabel}>
                {bottomText || "Balance"}
              </Text>
              <Text
                variant="titleLarge"
                style={{
                  color: bottomValueColor
                    ? bottomValueColor
                    : hideBalance
                      ? theme.colors.primary
                      : reportData.totalReceived >= reportData.totalSent
                        ? theme.colors.primary
                        : theme.colors.error,
                }}
              >
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "INR",
                }).format(
                  bottomValue !== undefined
                    ? bottomValue
                    : Math.round(
                        Math.abs(
                          reportData.totalReceived - reportData.totalSent,
                        ) * 100,
                      ) / 100,
                )}
              </Text>
            </View>
          )}
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
  balanceContainer: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  balanceLabel: {
    fontWeight: "600",
    opacity: 0.7,
  },
});

export default ReportItem;
