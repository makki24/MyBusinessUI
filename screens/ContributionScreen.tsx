// src/screens/ContributionScreen.tsx
import React, { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Swipeable from "react-native-gesture-handler/Swipeable";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
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
import { canDelete as canDeleteSelector } from "../recoil/selectors";

type ContributionScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const ContributionScreen: React.FC<ContributionScreenProps> = ({
  navigation,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();
  const [contributions, setContributions] = useRecoilState(contributionsState);
  const userCanDelete = useRecoilValue(canDeleteSelector);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            canDelete={userCanDelete}
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const styles = StyleSheet.create({
  deleteButton: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
});

export default ContributionScreen;
