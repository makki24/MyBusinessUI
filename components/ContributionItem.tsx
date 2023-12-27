// src/components/ContributionItem.tsx
import React, { FC } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, IconButton, Paragraph, Chip } from 'react-native-paper';
import { Contribution } from '../types';
import UserDetails from './common/UserDetails';

interface ContributionItemProps {
    contribution: Contribution;
    onPress: () => void;
    onDelete: () => void;
}

const ContributionItem: FC<ContributionItemProps> = ({ contribution, onPress, onDelete }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.contributionCard}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.titleContainer}>
                        <Title>{`${contribution.amount}`}</Title>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            {contribution.sendingMember && <Text style={{fontWeight: '800'}}>  From:  </Text>}
                            <Text>
                                {contribution.sendingMember && <UserDetails user={contribution.sendingMember} />} {/* Assuming User has a 'name' property */}
                                {!contribution.sendingMember && <Text>Self contribution</Text>}
                            </Text>
                        </View>
                    </View>
                    <Paragraph>{`Date: ${contribution.date.toDateString()}`}</Paragraph>
                    {contribution.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            <Text style={styles.tagsLabel}>Tags: </Text>
                            <View style={styles.tagChipsContainer}>
                                {contribution.tags.map((tag) => (
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
    contributionCard: {
        marginBottom: 16,
    },
    cardContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardActions: {
        position: 'absolute',
        bottom: 0,
        right: 0,
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
});

export default ContributionItem;
