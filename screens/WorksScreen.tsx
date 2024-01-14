// src/screens/WorksScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { FAB, Text, Button, Modal, Portal } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import WorkService from '../services/WorkService';
import WorkItem from '../components/WorkItem';
import { worksState } from '../recoil/atom';
import { Work } from '../types';
import commonScreenStyles from "../components/common/commonScreenStyles";
import commonStyles from "../components/common/commonStyles";

const WorksScreen = ({ navigation }) => {
    const [works, setWorks] = useRecoilState(worksState);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedWork, setSelectedWork] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const fetchWorks = async () => {
        try {
            setIsRefreshing(true);

            let worksData = await WorkService.getWorks();
            worksData = worksData.map(work => ({
                ...work,
                date: new Date(work.date)
            }))
            setWorks(worksData);
        } catch (error) {
            console.error('Error fetching works:', error.message || 'Unknown error');
            setError(error.message || 'Error fetching works. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWorks();
    }, []);

    const handleEditWork = (work: Work) => {
        const serializedDate = work.date.toISOString();
        const title = work.pricePerUnit ? `(${work.pricePerUnit} per ${work.workType.unit})` : '';
        navigation.navigate('WorkStack', { screen: 'AddWork' ,
            params: { title: `Edit Work ${title}`, work: { ...work, date: serializedDate }, isEditMode: true }
        })
    };

    const handleDeleteWork = async (work) => {
        setSelectedWork(work);
        setIsLoading(true);

        try {
            setIsDeleteModalVisible(true);
        } catch (error) {
            console.error('Error checking work details:', error.response?.data || 'Unknown error');
            setError(error.response?.data || 'Error checking work details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDeleteWork = async () => {
        setIsLoading(true);

        try {
            await WorkService.deleteWork(selectedWork.workID);
            setWorks((prevWorks) => prevWorks.filter((work) => work.workID !== selectedWork.workID));
        } catch (error) {
            console.error('Error deleting work:', error.response?.data || 'Unknown error');
            setError(error.message  || 'Error deleting work. Please try again.');
        } finally {
            setIsLoading(false);
            setSelectedWork(null);
            setIsDeleteModalVisible(false);
        }
    };

    const handleRefresh = () => {
        fetchWorks();
    };

    return (
        <View style={commonStyles.container}>
            {error && (
                <View style={commonStyles.errorContainer}>
                    <Text style={commonStyles.errorText}>{error}</Text>
                </View>
            )}

            {isLoading && (
                <View style={commonStyles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}

            {!error && (
                <FlatList
                    data={works}
                    renderItem={({ item }) => (
                        <WorkItem
                            work={item}
                            onPress={() => handleEditWork(item)}
                            onDelete={() => handleDeleteWork(item)}
                        />
                    )}
                    keyExtractor={(item) => item.workID.toString()} // Ensure key is a string
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                />
            )}

            <FAB style={commonScreenStyles.fab} icon="plus" onPress={() => navigation.navigate('WorkStack', { screen: 'WorkType', params: {title: 'Select Work type'} })} />

            {/* Delete Work Modal */}
            <Portal>
                <Modal visible={isDeleteModalVisible} onDismiss={() => setIsDeleteModalVisible(false)} contentContainerStyle={commonStyles.modalContainer}>
                    <Text>Are you sure you want to delete this work?</Text>
                    <View style={commonStyles.modalButtonGap} />
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={() => setIsDeleteModalVisible(false)}>
                        Cancel
                    </Button>
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="delete" mode="contained" onPress={confirmDeleteWork}>
                        Delete
                    </Button>
                </Modal>
            </Portal>
        </View>
    );
};

export default WorksScreen;

