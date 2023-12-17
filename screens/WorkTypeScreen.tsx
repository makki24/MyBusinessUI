import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { FAB, Text, Button, Modal, Portal, Searchbar } from 'react-native-paper'; // Import Searchbar
import { useRecoilState } from 'recoil';
import { workTypesState } from '../recoil/atom';
import WorkTypeItem from '../components/WorkTypeItem';
import { WorkType } from '../types';
import { useNavigation } from '@react-navigation/native';
import WorkService from "../services/WorkService";

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
        <View style={styles.container}>
            {/* Searchbar */}
            <Searchbar
                placeholder="Search"
                onChangeText={handleSearch}
                value={searchQuery}
                style={styles.searchBar}
            />

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

            <FAB style={styles.fab} icon="plus" onPress={() => navigation.navigate('WorkStack', { screen: 'AddWorkType' })} />

            {/* Delete Work Type Modal */}
            <Portal>
                <Modal visible={isDeleteModalVisible} onDismiss={() => setIsDeleteModalVisible(false)} contentContainerStyle={styles.modalContainer}>
                    <Text>Are you sure you want to delete this work type?</Text>
                    <View style={styles.modalButtonGap} />
                    <View style={styles.modalButtonGap} />
                    <Button icon="cancel" mode="outlined" onPress={() => setIsDeleteModalVisible(false)}>
                        Cancel
                    </Button>
                    <View style={styles.modalButtonGap} />
                    <Button icon="delete" mode="contained" onPress={confirmDeleteWorkType}>
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
    searchBar: {
        marginBottom: 10,
    },
});

export default WorkTypeScreen;
