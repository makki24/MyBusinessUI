import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, FlatList, RefreshControl, StyleSheet} from 'react-native';
import {FAB, Text, Modal, Portal, Searchbar, IconButton} from 'react-native-paper'; // Import Searchbar
import { useRecoilState } from 'recoil';
import { workTypesState } from '../recoil/atom';
import WorkTypeItem from '../components/WorkTypeItem';
import { WorkType } from '../types';
import WorkService from "../services/WorkService";
import commonScreenStyles from "../components/common/commonScreenStyles";
import commonStyles from "../components/common/commonStyles";
import LoadingError from "../components/common/LoadingError";
import Button from '../components/common/Button';
import {BottomSheetModal} from "@gorhom/bottom-sheet";
import SearchFilter from "../components/common/SearchFilter";

const WorkTypeScreen = ({navigation}) => {
    const [workTypes, setWorkTypes] = useRecoilState(workTypesState);
    const [filteredWorkTypes, setFilteredWorkTypes] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedWorkType, setSelectedWorkType] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['25%', '50%'], []);

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
            workType.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredWorkTypes(filtered);
    };

    const handleAddWork = (workType: WorkType) => {
        navigation.navigate('WorkStack', { screen: 'AddWork', params: {title: `Add ${workType.name} (${workType.defaultValuePerUnit} per ${workType.unit})`, workType} })
    }

    const openBottomSheet = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    return (
        <View style={commonStyles.container}>
            {/* Searchbar */}
            <SearchFilter searchQuery={searchQuery} handleSearch={handleSearch} openBottomSheet={openBottomSheet} />

            <LoadingError error={error} isLoading={isLoading} />

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
                    <Button title={'Cancel'} icon="cancel" mode="outlined" onPress={() => setIsDeleteModalVisible(false)} />
                    <View style={commonStyles.modalButtonGap} />
                    <Button title={'Delete'} icon="delete" mode="contained" onPress={confirmDeleteWorkType} />
                </Modal>
            </Portal>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={0}
                snapPoints={snapPoints}
            >
                <View style={commonStyles.container}>
                    <Text>Awesome 🎉</Text>
                </View>
            </BottomSheetModal>
        </View>
    );
};



export default WorkTypeScreen;
