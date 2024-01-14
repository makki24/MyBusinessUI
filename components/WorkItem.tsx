// src/components/WorkItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Card, Title, IconButton, Paragraph, Chip, Avatar } from 'react-native-paper';
import { Work } from '../types';
import UserDetails from "./common/UserDetails";
import commonItemStyles from "./common/commonItemStyles";
import commonAddScreenStyles from "./common/commonAddScreenStyles";
import commonStyles from "./common/commonStyles";

interface WorkItemProps {
    work: Work;
    onPress: () => void;
    onDelete: () => void;
}

const WorkItem: React.FC<WorkItemProps> = ({ work, onPress, onDelete }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={commonItemStyles.card}>
                <Card.Content style={commonItemStyles.cardContent}>
                    <View style={commonItemStyles.titleContainer}>
                        <Title>{work.workType.workTypeName}</Title>
                        <Text>
                            {work.user && <UserDetails user={work.user} />} {/* Use UserDetails component */}
                        </Text>
                    </View>
                    <View style={commonStyles.row}>
                        <Paragraph>Date: <Text style={{fontWeight: 'bold'}}>{work.date.toDateString()}</Text> </Paragraph>
                        <Paragraph>Quantity: <Text style={{fontWeight: 'bold'}}>{work.quantity}</Text> </Paragraph>
                    </View>
                    <View style={commonStyles.row}>
                        <Paragraph>Price Per Unit: <Text style={{fontWeight: 'bold'}}>{work.pricePerUnit}</Text> </Paragraph>
                        <Paragraph>Amount: <Text style={{fontWeight: 'bold'}}>{work.amount}</Text> </Paragraph>
                    </View>
                    <View style={commonStyles.row}>
                        {work.description && <Paragraph>Description: <Text style={{fontWeight: 'bold'}}>{work.description}</Text> </Paragraph>}
                    </View>
                    {work.tags.length > 0 && (
                        <View style={commonItemStyles.tagsContainer}>
                            <Text style={commonItemStyles.tagsLabel}>Tags: </Text>
                            <View style={commonItemStyles.tagChipsContainer}>
                                {work.tags.map((tag) => (
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

export default WorkItem;
