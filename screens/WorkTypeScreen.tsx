import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { FAB, Text, Button, Modal, Portal, Searchbar } from 'react-native-paper'; // Import Searchbar
import { useRecoilState } from 'recoil';
import { workTypesState } from '../recoil/atom';
import WorkTypeItem from '../components/WorkTypeItem';
import { WorkType } from '../types';
import { useNavigation } from '@react-navigation/native';
import WorkService from "../services/WorkService";
import commonScreenStyles from "../components/common/commonScreenStyles";
import commonStyles from "../components/common/commonStyles";

const WorkTypeScreen = ({navigation}) => {
    const [workTypes, setWorkTypes] = useRecoilState(workTypesState);
    const [filteredWorkTypes, setFilteredWorkTypes] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedWorkType, setSelectedWorkType] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchWorkTypes = async () => {
        try {
            setIsRefreshing(true);

            const workTypesData = await WorkService.getWorkTypes();
            setWorkTypes(workTypesData);
            setFilteredWorkTypes(workTypesData);
        } catch (error) {
            console.error('Error fetching work types:', error.response?.data || 'Unknown error');
            setError(error.message || 'Error fetching work types. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWorkTypes();
    }, []);

    useEffect(() => {
        setFilteredWorkTypes(workTypes);
    }, [workTypes]);

    const handleEditWorkType = (workType) => {
        navigation.navigate('WorkStack', { screen: 'AddWorkType' , params: { title: 'Edit Work Type', workType, isEditMode: true }})
    };

    const confirmDeleteWorkType = async () => {
        setIsLoading(true);

        try {
            await WorkService.deleteWorkType(selectedWorkType.id);
            setWorkTypes((prevWorkTypes) => prevWorkTypes.filter((wt) => wt.id !== selectedWorkType.id));
            setFilteredWorkTypes((prevWorkTypes) => prevWorkTypes.filter((wt) => wt.id !== selectedWorkType.id));
        } catch (error) {
            console.error('Error deleting work type:', error.response?.data || 'Unknown error');
            setError(error.message || 'Error deleting work type. Please try again.');
        } finally {
            setIsLoading(false);
            setSelectedWorkType(null);
            setIsDeleteModalVisible(false);
        }
    };

    const handleDeleteWorkType = (workType) => {
        setSelectedWorkType(workType);
        setIsDeleteModalVisible(true);
    };

    const handleRefresh = () => {
        fetchWorkTypes();
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = workTypes.filter((workType) =>
            workType.workTypeName.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredWorkTypes(filtered);
    };

    const handleAddWork = (workType: WorkType) => {
        navigation.navigate('WorkStack', { screen: 'AddWork', params: {title: `Add ${workType.workTypeName} (${workType.defaultValuePerUnit} per ${workType.unit})`, workType} })
    }

    return (
        <View style={commonStyles.container}>
            {/* Searchbar */}
            <Searchbar
                placeholder="Search"
                onChangeText={handleSearch}
                value={searchQuery}
                style={commonScreenStyles.searchBar}
            />

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
                    data={filteredWorkTypes}
                    renderItem={({ item }) => (
                        <WorkTypeItem
                            workType={item}
                            onPress={() => handleAddWork(item)}
                            onEdit={(workType) => handleEditWorkType(workType)}
                            onDelete={() => handleDeleteWorkType(item)}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()} // Ensure key is a string
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                />
            )}

            <FAB style={commonScreenStyles.fab} icon="plus" onPress={() => navigation.navigate('WorkStack', { screen: 'AddWorkType' })} />

            {/* Delete Work Type Modal */}
            <Portal>
                <Modal visible={isDeleteModalVisible} onDismiss={() => setIsDeleteModalVisible(false)} contentContainerStyle={commonStyles.modalContainer}>
                    <Text>Are you sure you want to delete this work type?</Text>
                    <View style={commonStyles.modalButtonGap} />
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={() => setIsDeleteModalVisible(false)}>
                        Cancel
                    </Button>
                    <View style={commonStyles.modalButtonGap} />
                    <Button icon="delete" mode="contained" onPress={confirmDeleteWorkType}>
                        Delete
                    </Button>
                </Modal>
            </Portal>
        </View>
    );
};

export default WorkTypeScreen;
