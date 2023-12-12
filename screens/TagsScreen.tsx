import React, { useEffect, useState } from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity} from 'react-native';
import {FAB, Text, Button, Modal, Portal, Card, Title, IconButton} from 'react-native-paper';
import { useRecoilState } from 'recoil';
import { tagsState } from '../recoil/atom';
import TagsService from "../services/TagsService"; // Assuming you have a tags atom

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
        setError(error.response?.message || defaultMessage);
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
                    data={tags}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleEditTag(item)}>
                            <Card style={styles.roleCard}>
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

            <FAB style={styles.fab} icon="plus" onPress={() => navigation.navigate('AddTag')} />
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
    roleCard: {
        marginBottom: 16,
    },
});

export default TagsScreen;
