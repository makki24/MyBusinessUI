import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  Icon,
  IconButton,
  Paragraph,
  Snackbar,
  Title,
} from "react-native-paper";

import { tagsState } from "../recoil/atom";
import CustomDropDown from "../components/common/CustomDropdown";
import { useRecoilState } from "recoil";
import ReportService from "../services/ReportService";
import { ExpenseReport, Filter } from "../types";
import commonItemStyles from "../src/styles/commonItemStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import {
  CONTAINER_PADDING,
  DROPDOWN_HEIGHT,
  ICON_SIZE,
  UI_ELEMENTS_GAP,
} from "../src/styles/constants";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import CustomDateRange from "../src/components/common/CustomDateRange";

interface ReportScreenProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
}

const ReportScreen: React.FC<ReportScreenProps> = ({ navigation }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number>(null);
  const [tags] = useRecoilState(tagsState);
  const [isDataLoading] = useState<boolean>(false);
  const [report, setReport] = useState<ExpenseReport>(null);
  const [profitOrLoss, setProfitOrLoss] = useState<number>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false); // Added downloadLoading state

  const [excludingTagOpen, setExcludingTagOpen] = useState(false);
  const [selectedExcludingTags, setSelectedExcludingTags] =
    useState<number>(null);
  const [excludingTags] = useRecoilState(tagsState);
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const rangeState = React.useState({
    startDate: thisMonth,
    endDate: new Date(),
  });

  const generateReport = async () => {
    setError("");
    setIsLoading(true);

    try {
      const filter = createFilter();
      const reportsRes = await ReportService.getReport(filter);
      setProfitOrLoss(
        reportsRes.totalSaleAmount +
          reportsRes.totalContributionAmount -
          (reportsRes.totalExpenseAmount + reportsRes.totalWorkAmount),
      );
      setReport(reportsRes);
    } catch (err) {
      setError(err.message ?? "An error occurred while generating the report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (!selectedTags) {
      setError("Please select a tag first");
      return;
    }

    generateReport();
  };

  const createFilter = () => {
    return {
      tags: [{ id: selectedTags }],
      excludeTags: selectedExcludingTags ? [{ id: selectedExcludingTags }] : [],
      fromDate: rangeState[0].startDate,
      toDate: rangeState[0].endDate,
    } as Filter;
  };

  const downloadReport = async () => {
    setError("");
    setDownloadLoading(true); // Set loading to true when starting the download
    try {
      const filter = createFilter();
      await ReportService.downloadReport(filter);
      setSnackbarVisible(true);
    } catch (e) {
      setError(e.message ?? "Some error");
    } finally {
      setDownloadLoading(false); // Set loading to false after the download completes or encounters an error
    }
  };

  const goToCalc = () => {
    const range: { startDate: string; endDate: string } = {
      startDate: "",
      endDate: "",
    };

    range.startDate = rangeState[0].startDate.toISOString();
    range.endDate = rangeState[0].endDate.toISOString();

    navigation.navigate("ReportStack", {
      screen: "Calculator",
      params: {
        title: "Select Work type",
        tagId: selectedTags,
        excludeTagId: selectedExcludingTags,
        range: range,
      },
    });
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <LoadingError error={error} isLoading={isLoading} />
        <View style={{ marginBottom: UI_ELEMENTS_GAP }}>
          <CustomDateRange rangeState={rangeState} />
        </View>
        <CustomDropDown
          items={tags}
          zIndex={2000}
          zIndexInverse={2000}
          schema={{
            label: "name",
            value: "id",
          }}
          open={tagOpen}
          setOpen={setTagOpen}
          containerStyle={{
            height: DROPDOWN_HEIGHT,
            marginBottom: CONTAINER_PADDING,
          }}
          value={selectedTags}
          setValue={setSelectedTags}
          itemSeparator={true}
          placeholder="Select Tags"
          loading={isDataLoading}
        />

        <CustomDropDown
          items={excludingTags}
          zIndex={1000}
          zIndexInverse={1000}
          schema={{
            label: "name",
            value: "id",
          }}
          open={excludingTagOpen}
          setOpen={setExcludingTagOpen}
          containerStyle={{
            height: DROPDOWN_HEIGHT,
            marginBottom: CONTAINER_PADDING,
          }}
          value={selectedExcludingTags}
          setValue={setSelectedExcludingTags}
          itemSeparator={true}
          placeholder="Exclude Tags"
          loading={isDataLoading}
        />

        <Button mode="contained" onPress={handleGenerateReport}>
          See Report
        </Button>

        {report && (
          <Card style={commonItemStyles.card}>
            <Card.Content>
              <Title>Expense Report</Title>
              <Paragraph>Total Work Amount: {report.totalWorkAmount}</Paragraph>
              <Paragraph>
                Total Expense Amount: {report.totalExpenseAmount}
              </Paragraph>
              <Paragraph>Total Sale Amount: {report.totalSaleAmount}</Paragraph>
              <Paragraph>
                Total Contribution: {report.totalContributionAmount}
              </Paragraph>
              <Divider />
            </Card.Content>
            <Card.Actions style={commonStyles.row}>
              <View style={styles.profitOrLossContainer}>
                <View
                  style={[
                    styles.profitOrLossIcon,
                    profitOrLoss <= 0 && styles.hidden,
                  ]}
                >
                  <Icon
                    source="arrow-up-bold-circle"
                    color="green"
                    size={ICON_SIZE}
                  />
                </View>
                <View
                  style={[
                    styles.profitOrLossIcon,
                    profitOrLoss > 0 && styles.hidden,
                  ]}
                >
                  <Icon
                    source="arrow-down-bold-circle"
                    color="red"
                    size={ICON_SIZE}
                  />
                </View>
                <Paragraph style={styles.profitOrLossText}>
                  {profitOrLoss > 0 ? (
                    <>Profit: {profitOrLoss}</>
                  ) : (
                    <>Loss: {Math.abs(profitOrLoss)}</>
                  )}
                </Paragraph>
              </View>
              <Button
                icon="download"
                mode="contained"
                onPress={downloadReport}
                disabled={downloadLoading} // Disable the button when downloading
                loading={downloadLoading}
              >
                {"Download"}
              </Button>
              <IconButton
                icon={"calculator-variant"}
                mode={"contained"}
                onPress={goToCalc}
              />
            </Card.Actions>
          </Card>
        )}

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          action={{
            label: "OK",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          PDF has been sent to your email!
        </Snackbar>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1, // Allow the content to grow within the ScrollView
  },
  profitOrLossContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  profitOrLossIcon: {
    marginRight: UI_ELEMENTS_GAP / 2,
  },
  profitOrLossText: {
    fontWeight: "bold",
  },
  hidden: {
    display: "none",
  },
});

export default ReportScreen;
