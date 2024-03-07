// src/screens/ContributionScreen.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { FAB, Text, Button, Modal, Portal } from "react-native-paper";
import { useRecoilState } from "recoil";
import ContributionService from "../services/ContributionService";
import ContributionItem from "../components/ContributionItem";
import { contributionsState, userState } from "../recoil/atom";
import { Contribution } from "../types";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

type ContributionScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const ContributionScreen: React.FC<ContributionScreenProps> = ({
  navigation,
}) => {
  const [contributions, setContributions] = useRecoilState(contributionsState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [_, setLoggedInUser] = useRecoilState(userState);

  const fetchContributions = async () => {
    try {
      setIsRefreshing(true);

      let contributionsData = await ContributionService.getContributions();
      contributionsData = contributionsData.map((contribution) => ({
        ...contribution,
        date: new Date(contribution.date),
      }));
      setContributions(contributionsData);
    } catch (error) {
      setError(
        error.message || "Error fetching contributions. Please try again.",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const handleEditContribution = (contribution: Contribution) => {
    const serializedDate = contribution.date.toISOString();

    navigation.navigate("ProfileStack", {
      screen: "AddContribution",
      params: {
        title: `Edit Contribution`,
        contribution: { ...contribution, date: serializedDate },
        isEditMode: true,
      },
    });
  };

  const handleDeleteContribution = async (contribution) => {
    setSelectedContribution(contribution);
    setIsLoading(true);

    try {
      setIsDeleteModalVisible(true);
    } catch (error) {
      setError(
        error.message ||
          "Error checking contribution details. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteContribution = async () => {
    setIsLoading(true);

    try {
      await ContributionService.deleteContribution(selectedContribution.id);
      setContributions((prevContributions) =>
        prevContributions.filter(
          (contribution) => contribution.id !== selectedContribution.id,
        ),
      );
      setLoggedInUser((currVal) => ({
        ...currVal,
        amountHolding: currVal.amountHolding - selectedContribution.amount,
      }));
    } catch (error) {
      setError(
        error.message || "Error deleting contribution. Please try again.",
      );
    } finally {
      setIsLoading(false);
      setSelectedContribution(null);
      setIsDeleteModalVisible(false);
    }
  };

  const handleRefresh = () => {
    fetchContributions();
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />

      {!error && (
        <FlatList
          data={contributions}
          renderItem={({ item }) => (
            <ContributionItem
              contribution={item}
              onPress={() => handleEditContribution(item)}
              onDelete={() => handleDeleteContribution(item)}
            />
          )}
          keyExtractor={(item) => item.id.toString()} // Ensure key is a string
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}

      <FAB
        style={commonScreenStyles.fab}
        icon="plus"
        onPress={() =>
          navigation.navigate("ProfileStack", {
            screen: "AddContribution",
            params: { title: "Create Contribution" },
          })
        }
      />

      {/* Delete Contribution Modal */}
      <Portal>
        <Modal
          visible={isDeleteModalVisible}
          onDismiss={() => setIsDeleteModalVisible(false)}
          contentContainerStyle={commonStyles.modalContainer}
        >
          <Text>Are you sure you want to delete this contribution?</Text>
          <View style={commonStyles.modalButtonGap} />
          <View style={commonStyles.modalButtonGap} />
          <Button
            icon="cancel"
            mode="outlined"
            onPress={() => setIsDeleteModalVisible(false)}
          >
            Cancel
          </Button>
          <View style={commonStyles.modalButtonGap} />
          <Button
            icon="delete"
            mode="contained"
            onPress={confirmDeleteContribution}
          >
            Delete
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

export default ContributionScreen;
