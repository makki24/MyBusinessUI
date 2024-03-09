// src/screens/SaleScreen.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { FAB, Text, Button, Modal, Portal } from "react-native-paper";
import { useRecoilState } from "recoil";
import SaleService from "../services/SaleService";
import SaleItem from "../components/SaleItem";
import { salesState } from "../recoil/atom";
import { Sale } from "../types";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

type SaleScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
};

const SaleScreen: React.FC<SaleScreenProps> = ({ navigation }) => {
  const [sales, setSales] = useRecoilState(salesState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const fetchSales = async () => {
    try {
      setIsRefreshing(true);

      let salesData = await SaleService.getSales();
      salesData = salesData.map((sale) => ({
        ...sale,
        date: new Date(sale.date),
      }));
      setSales(salesData);
    } catch (fetchError) {
      setError(fetchError.message || "Error fetching sales. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSales();
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

  const handleRefresh = () => {
    fetchSales();
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />

      {!error && (
        <FlatList
          data={sales}
          renderItem={({ item }) => (
            <SaleItem
              sale={item}
              onPress={() => handleEditSale(item)}
              onDelete={() => handleDeleteSale(item)}
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
          navigation.navigate("SaleStack", {
            screen: "AddSale",
            params: { title: "Create Sale" },
          })
        }
      />

      {/* Delete Sale Modal */}
      <Portal>
        <Modal
          visible={isDeleteModalVisible}
          onDismiss={() => setIsDeleteModalVisible(false)}
          contentContainerStyle={commonStyles.modalContainer}
        >
          <Text>Are you sure you want to delete this sale?</Text>
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
          <Button icon="delete" mode="contained" onPress={confirmDeleteSale}>
            Delete
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

export default SaleScreen;
