// src/screens/ContributionScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { FAB, Text, Button, Modal, Portal } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import ContributionService from '../services/ContributionService';
import ContributionItem from '../components/ContributionItem';
import { contributionsState, userState } from '../recoil/atom';
import { Contribution } from '../types';

const ContributionScreen = ({ navigation }) => {
    const [contributions, setContributions] = useRecoilState(contributionsState);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedContribution, setSelectedContribution] = useState<Contribution>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [loggedInUser, setLoggedInUser] = useRecoilState(userState);

    const fetchContributions = async () => {
        try {
            setIsRefreshing(true);

            let contributionsData = await ContributionService.getContributions();
            contributionsData = contributionsData.map(contribution => ({
                ...contribution,
                date: new Date(contribution.date)
            }))
            setContributions(contributionsData);
        } catch (error) {
            console.error('Error fetching contributions:', error.message || 'Unknown error');
            setError(error.message || 'Error fetching contributions. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchContributions();
    }, []);

    const handleEditContribution = (contribution: Contribution) => {
        const serializedDate = contribution.date.toISOString();

        navigation.navigate('ProfileStack', {
            screen: 'AddContribution',
            params: { title: `Edit Contribution`, contribution: { ...contribution, date: serializedDate }, isEditMode: true },
        });
    };

    const handleDeleteContribution = async (contribution) => {
        setSelectedContribution(contribution);
        setIsLoading(true);

        try {
            setIsDeleteModalVisible(true);
        } catch (error) {
            console.error('Error checking contribution details:', error.response?.data || 'Unknown error');
            setError(error.message || 'Error checking contribution details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDeleteContribution = async () => {
        setIsLoading(true);

        try {
            await ContributionService.deleteContribution(selectedContribution.id);
            setContributions((prevContributions) => prevContributions.filter((contribution) => contribution.id !== selectedContribution.id));
            setLoggedInUser(currVal => ({
                ...currVal,
                amountHolding: currVal.amountHolding - selectedContribution.amount
            }))
        } catch (error) {
            console.error('Error deleting contribution:', error.response?.data || 'Unknown error');
            setError(error.message || 'Error deleting contribution. Please try again.');
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
                    data={contributions}
                    renderItem={({ item }) => (
                        <ContributionItem
                            contribution={item}
                            onPress={() => handleEditContribution(item)}
                            onDelete={() => handleDeleteContribution(item)}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()} // Ensure key is a string
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                />
            )}

            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('ProfileStack', { screen: 'AddContribution', params: { title: 'Create Contribution' } })}
            />

            {/* Delete Contribution Modal */}
            <Portal>
                <Modal visible={isDeleteModalVisible} onDismiss={() => setIsDeleteModalVisible(false)} contentContainerStyle={styles.modalContainer}>
                    <Text>Are you sure you want to delete this contribution?</Text>
                    <View style={styles.modalButtonGap} />
                    <View style={styles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={() => setIsDeleteModalVisible(false)}>
                        Cancel
                    </Button>
                    <View style={styles.modalButtonGap} />
                    <Button icon="delete" mode="contained" onPress={confirmDeleteContribution}>
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

export default ContributionScreen;