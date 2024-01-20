import React, { useEffect, useState } from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity} from 'react-native';
import {FAB, Text, Button, Modal, Portal, Card, Title, IconButton} from 'react-native-paper';
import { useRecoilState } from 'recoil';
import { tagsState } from '../recoil/atom';
import TagsService from "../services/TagsService";
import commonScreenStyles from "../components/common/commonScreenStyles";
import commonItemStyles from "../components/common/commonItemStyles";
import commonStyles from "../components/common/commonStyles";
import LoadingError from "../components/common/LoadingError"; // Assuming you have a tags atom

const TagsScreen = ({ navigation }) => {
    const [tags, setTags] = useRecoilState(tagsState);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const fetchTags = async () => {
        try {
            setIsRefreshing(true);
            const tagsData = await TagsService.getTags();
            setTags(tagsData);
        } catch (error) {
            handleError(error, 'Error fetching tags. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleError = (error, defaultMessage) => {
        setError(error.message || defaultMessage);
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleEditTag = (tag) => {
    };

    const handleRefresh = () => {
        fetchTags();
    };

    return (
        <View style={commonStyles.container}>
            <LoadingError error={error} isLoading={isLoading} />

            {!error && (
                <FlatList
                    data={tags}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleEditTag(item)}>
                            <Card style={commonItemStyles.card}>
                                <Card.Content>
                                    <Title>{item.tagName}</Title>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id.toString()} // Ensure key is a string
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                />
            )}

            <FAB style={commonScreenStyles.fab} icon="plus" onPress={() => navigation.navigate('AddTag')} />
        </View>
    );
};

export default TagsScreen;
