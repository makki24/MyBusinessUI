// src/screens/SaleScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { FAB, Text, Button, Modal, Portal } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import SaleService from '../services/SaleService';
import SaleItem from '../components/SaleItem';
import {salesState, userState} from '../recoil/atom';
import { Sale } from '../types';

const SaleScreen = ({ navigation }) => {
    const [sales, setSales] = useRecoilState(salesState);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [loggedInUser, setLoggedInUser] = useRecoilState(userState);

    const fetchSales = async () => {
        try {
            setIsRefreshing(true);

            let salesData = await SaleService.getSales();
            salesData = salesData.map(sale => ({
                ...sale,
                date: new Date(sale.date)
            }))
            setSales(salesData);
        } catch (error) {
            console.error('Error fetching sales:', error.message || 'Unknown error');
            setError(error.message || 'Error fetching sales. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const handleEditSale = (sale: Sale) => {
        const serializedDate = sale.date.toISOString();

        navigation.navigate('SaleStack', {
            screen: 'AddSale',
            params: { title: `Edit Sale`, sale: {...sale, date: serializedDate}, isEditMode: true },
        });
    };

    const handleDeleteSale = async (sale) => {
        setSelectedSale(sale);
        setIsLoading(true);

        try {
            setIsDeleteModalVisible(true);
        } catch (error) {
            console.error('Error checking sale details:', error.response?.data || 'Unknown error');
            setError(error.message  || 'Error checking sale details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDeleteSale = async () => {
        setIsLoading(true);

        try {
            await SaleService.deleteSale(selectedSale.id);
            setSales((prevSales) => prevSales.filter((sale) => sale.id !== selectedSale.id));
        } catch (error) {
            console.error('Error deleting sale:', error.response?.data || 'Unknown error');
            setError(error.message  || 'Error deleting sale. Please try again.');
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
        <View style={styles.container}>
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}

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
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                />
            )}

            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('SaleStack', { screen: 'AddSale', params: { title: 'Create Sale' } })}
            />

            {/* Delete Sale Modal */}
            <Portal>
                <Modal visible={isDeleteModalVisible} onDismiss={() => setIsDeleteModalVisible(false)} contentContainerStyle={styles.modalContainer}>
                    <Text>Are you sure you want to delete this sale?</Text>
                    <View style={styles.modalButtonGap} />
                    <View style={styles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={() => setIsDeleteModalVisible(false)}>
                        Cancel
                    </Button>
                    <View style={styles.modalButtonGap} />
                    <Button icon="delete" mode="contained" onPress={confirmDeleteSale}>
                        Delete
                    </Button>
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    errorContainer: {
        backgroundColor: 'red',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'white',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignSelf: 'center', // Center the modal on the screen
        width: '80%', // Set the width to a percentage of the screen width
    },
    modalButtonGap: {
        height: 5,
    },
});

export default SaleScreen;
