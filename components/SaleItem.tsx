// src/components/SaleItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card, Title, IconButton, Paragraph, Chip, Avatar } from 'react-native-paper';
import { Sale } from '../types';
import UserDetails from './common/UserDetails';
import commonItemStyles from "./common/commonItemStyles";
import commonStyles from "./common/commonStyles";

interface SaleItemProps {
    sale: Sale;
    onPress: () => void;
    onDelete: () => void;
}

const SaleItem: React.FC<SaleItemProps> = ({ sale, onPress, onDelete }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={commonItemStyles.card}>
                <Card.Content style={sale.tags.length ? commonItemStyles.cardContent: {}}>
                    <View style={commonItemStyles.titleContainer}>
                        <Title>{sale.type}</Title>
                        <Text>
                            {sale.user && <UserDetails user={sale.user} />} {/* Use UserDetails component */}
                        </Text>
                    </View>
                    <View style={commonStyles.row}>
                        <Paragraph>{`Date: ${sale.date.toDateString()}`}</Paragraph>
                        <Paragraph>{`Quantity: ${sale.quantity}`}</Paragraph>
                    </View>
                    <View style={commonStyles.row}>
                        <Paragraph>{`Price Per Unit: ${sale.pricePerUnit}`}</Paragraph>
                        <Paragraph>{`Amount: ${sale.amount}`}</Paragraph>
                    </View>
                    <View style={commonStyles.row}>
                        {sale.description && <Paragraph>{`Description: ${sale.description}`}</Paragraph>}
                    </View>
                    {sale.tags.length > 0 && (
                        <View style={commonItemStyles.tagsContainer}>
                            <Text style={commonItemStyles.tagsLabel}>Tags: </Text>
                            <View style={commonItemStyles.tagChipsContainer}>
                                {sale.tags.map((tag) => (
                                    <Chip key={tag.id} style={commonItemStyles.tagChip}>
                                        {tag.name}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    )}
                </Card.Content>
                <Card.Actions style={sale.tags.length ? commonItemStyles.cardActions: {}}>
                    <IconButton icon="delete" onPress={onDelete} />
                </Card.Actions>
            </Card>
        </TouchableOpacity>
    );
};

export default SaleItem;
