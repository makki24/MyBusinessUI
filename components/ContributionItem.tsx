// src/components/ContributionItem.tsx
import React, { FC } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card, Title, IconButton, Paragraph, Chip } from 'react-native-paper';
import { Contribution } from '../types';
import UserDetails from './common/UserDetails';
import commonItemStyles from "./common/commonItemStyles";

interface ContributionItemProps {
    contribution: Contribution;
    onPress: () => void;
    onDelete: () => void;
}

const ContributionItem: FC<ContributionItemProps> = ({ contribution, onPress, onDelete }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={commonItemStyles.card}>
                <Card.Content style={commonItemStyles.cardContent}>
                    <View style={commonItemStyles.titleContainer}>
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
                        <View style={commonItemStyles.tagsContainer}>
                            <Text style={commonItemStyles.tagsLabel}>Tags: </Text>
                            <View style={commonItemStyles.tagChipsContainer}>
                                {contribution.tags.map((tag) => (
                                    <Chip key={tag.id} style={commonItemStyles.tagChip}>
                                        {tag.tagName}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    )}
                </Card.Content>
                <Card.Actions style={commonItemStyles.cardActions}>
                    <IconButton icon="delete" onPress={onDelete} />
                </Card.Actions>
            </Card>
        </TouchableOpacity>
    );
};

export default ContributionItem;
