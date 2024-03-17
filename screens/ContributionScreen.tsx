// src/screens/ContributionScreen.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { FAB } from "react-native-paper";
import { useRecoilState } from "recoil";
import ContributionService from "../services/ContributionService";
import ContributionItem from "../components/ContributionItem";
import { contributionsState, userState } from "../recoil/atom";
import { Contribution } from "../types";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import ConfirmationModal from "../components/common/ConfirmationModal";

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
    } catch (fetchError) {
      setError(
        fetchError.message || "Error fetching contributions. Please try again.",
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

    setIsDeleteModalVisible(true);
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
    } catch (deleteError) {
      setError(
        deleteError.message || "Error deleting contribution. Please try again.",
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
      <ConfirmationModal
        warningMessage={"Are you sure you want to delete this contribution?"}
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        onConfirm={confirmDeleteContribution}
      />
    </View>
  );
};

export default ContributionScreen;
