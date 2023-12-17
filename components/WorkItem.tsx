// src/components/WorkItem.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Title, IconButton, Paragraph, Chip, Avatar } from 'react-native-paper';
import { Work } from '../types';
import { DEFAULT_AVATAR_URL } from "../constants/mybusiness.constants";

interface WorkItemProps {
    work: Work;
    onPress: () => void;
    onDelete: () => void;
}

const WorkItem: React.FC<WorkItemProps> = ({ work, onPress, onDelete }) => {
    const [imageExists, setImageExists] = useState(true);

    const checkImageExists = async () => {
        try {
            if (!work.user.picture)
                throw new Error("No image");
            const response = await fetch(work.user.picture);
            setImageExists(response.ok);
        } catch (error) {
            setImageExists(false);
        }
    };

    useEffect(() => {
        checkImageExists();
    }, []); // Call when the component mounts

    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.workCard}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.titleContainer}>
                        <Title>{work.workType.workTypeName}</Title>
                        {work.user && (
                            <View style={styles.userContainer}>
                                {work.user.picture && (
                                    <Avatar.Image
                                        size={40}
                                        source={{ uri: imageExists ? work.user.picture : DEFAULT_AVATAR_URL }}
                                        style={styles.avatar}
                                    />
                                )}
                                <Text style={styles.username}>{work.user.username}</Text>
                            </View>
                        )}
                    </View>
                    <Paragraph>{`Date: ${work.date.toDateString()}`}</Paragraph>
                    <Paragraph>{`Quantity: ${work.quantity}`}</Paragraph>
                    <Paragraph>{`Amount: ${work.amount}`}</Paragraph>
                    {work.description && <Paragraph>{`Description: ${work.description}`}</Paragraph>}
                    {work.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            <Text style={styles.tagsLabel}>Tags: </Text>
                            <View style={styles.tagChipsContainer}>
                                {work.tags.map((tag) => (
                                    <Chip key={tag.id} style={styles.tagChip}>
                                        {tag.tagName}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    )}
                </Card.Content>
                <Card.Actions style={styles.cardActions}>
                    <IconButton icon="delete" onPress={onDelete} />
                </Card.Actions>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    workCard: {
        marginBottom: 16,
    },
    cardContent: {
        paddingHorizontal: 16,
        paddingBottom: 16, // Added paddingBottom to create space for the delete button
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginRight: 8,
    },
    username: {
        fontWeight: 'bold',
    },
    tagsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    tagsLabel: {
        fontWeight: 'bold',
        marginRight: 8,
    },
    tagChipsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagChip: {
        marginHorizontal: 4,
    },
    cardActions: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
});

export default WorkItem;
