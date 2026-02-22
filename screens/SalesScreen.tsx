// src/screens/SaleScreen.tsx
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import SaleService from "../services/SaleService";
import SaleItem from "../components/SaleItem";
import { salesState } from "../recoil/atom";
import { Filter, Sale } from "../types";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import ConfirmationModal from "../components/common/ConfirmationModal";
import ItemsList from "../src/components/common/ItemsList";
import saleService from "../services/SaleService";
import filterService from "../src/service/FilterService";
import { canDelete as canDeleteSelector } from "../recoil/selectors";

type SaleScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const SaleScreen: React.FC<SaleScreenProps> = ({ navigation }) => {
  const [sales, setSales] = useRecoilState(salesState);
  const userCanDelete = useRecoilValue(canDeleteSelector);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [uniqueFilters, setUniqueFilters] = useState<Filter>({
    sender: [],
    receiver: [],
    tags: [],
    user: [],
  });

  const getUnique = async () => {
    const uniQueFilter = await filterService.getSaleFilters();
    setUniqueFilters(uniQueFilter);
  };

  const transformedData = (itemsData) =>
    itemsData.map((expense) => ({
      ...expense,
      date: new Date(expense.date),
    }));

  useEffect(() => {
    getUnique();
  }, []);

  const handleEditSale = (sale: Sale) => {
    const serializedDate = sale.date.toISOString();

    navigation.navigate("SaleStack", {
      screen: "AddSale",
      params: {
        title: `Edit Sale`,
        sale: { ...sale, date: serializedDate },
        isEditMode: true,
      },
    });
  };

  const handleDeleteSale = async (sale) => {
    setSelectedSale(sale);

    setIsDeleteModalVisible(true);
  };

  const confirmDeleteSale = async () => {
    setIsLoading(true);

    try {
      await SaleService.deleteSale(selectedSale.id);
      setSales((prevSales) =>
        prevSales.filter((sale) => sale.id !== selectedSale.id),
      );
    } catch (deleteError) {
      setError(deleteError.message || "Error deleting sale. Please try again.");
    } finally {
      setIsLoading(false);
      setSelectedSale(null);
      setIsDeleteModalVisible(false);
    }
  };

  const handleSearch = (_arg) => {
    return sales;
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />

      <ItemsList
        uniQueFilterValues={uniqueFilters}
        searchBar={false}
        sort={true}
        handleSearch={handleSearch}
        fetchData={saleService.filterSale}
        recoilState={salesState}
        renderItem={({ item }) => (
          <SaleItem
            sale={item}
            onPress={() => handleEditSale(item)}
            onDelete={() => handleDeleteSale(item)}
            canDelete={userCanDelete}
          />
        )}
        transFormData={transformedData}
        onAdd={() => {
          navigation.navigate("SaleStack", {
            screen: "AddSale",
            params: { title: "Create Sale" },
          });
        }}
      />

      <ConfirmationModal
        warningMessage={"Are you sure you want to delete this sale?"}
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        onConfirm={confirmDeleteSale}
      />
    </View>
  );
};

export default SaleScreen;
