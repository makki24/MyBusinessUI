// src/screens/ContributionScreen.tsx
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRecoilState } from "recoil";
import ContributionService from "../services/ContributionService";
import ContributionItem from "../components/ContributionItem";
import { contributionsState, userState } from "../recoil/atom";
import { Contribution, Filter } from "../types";
import commonStyles from "../src/styles/commonStyles";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import ConfirmationModal from "../components/common/ConfirmationModal";
import ItemsList from "../src/components/common/ItemsList";
import filterService from "../src/service/FilterService";
import LoadingError from "../components/common/LoadingError";

type ContributionScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const ContributionScreen: React.FC<ContributionScreenProps> = ({
  navigation,
}) => {
  const [contributions, setContributions] = useRecoilState(contributionsState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [_, setLoggedInUser] = useRecoilState(userState);
  const [uniqueFilters, setUniqueFilters] = useState<Filter>({
    sender: [],
    receiver: [],
    tags: [],
    user: [],
  });

  const transformAndSetContribution = (contributionData) => {
    return contributionData.map((contribution) => ({
      ...contribution,
      date: new Date(contribution.date),
    }));
  };

  const getUnique = async () => {
    const uniQueFilter = await filterService.getContributionFilters();
    setUniqueFilters(uniQueFilter);
  };

  useEffect(() => {
    if (error) setContributions([]);
  }, [error]);

  useEffect(() => {
    getUnique();
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

  const handleSearch = (query) => {
    return contributions.filter((contribution) =>
      contribution.receiver.name.toLowerCase().includes(query.toLowerCase()),
    );
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />
      <ItemsList
        uniQueFilterValues={uniqueFilters}
        searchBar={true}
        sort={true}
        handleSearch={handleSearch}
        fetchData={ContributionService.filterContribution}
        recoilState={contributionsState}
        renderItem={({ item }) => (
          <ContributionItem
            contribution={item}
            onPress={() => handleEditContribution(item)}
            onDelete={() => handleDeleteContribution(item)}
          />
        )}
        transFormData={transformAndSetContribution}
        onAdd={() => {
          navigation.navigate("ProfileStack", {
            screen: "AddContribution",
            params: { title: "Create Contribution" },
          });
        }}
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
