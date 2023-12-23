// src/components/WorkItem.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Title, IconButton, Paragraph, Chip, Avatar } from 'react-native-paper';
import { Work } from '../types';
import UserDetails from "./common/UserDetails";

interface WorkItemProps {
    work: Work;
    onPress: () => void;
    onDelete: () => void;
}

const WorkItem: React.FC<WorkItemProps> = ({ work, onPress, onDelete }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.workCard}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.titleContainer}>
                        <Title>{work.workType.workTypeName}</Title>
                        <Text>
                            {work.user && <UserDetails user={work.user} />} {/* Use UserDetails component */}
                        </Text>
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
