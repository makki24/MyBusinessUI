// src/components/SaleItem.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, IconButton, Paragraph, Chip, Avatar } from 'react-native-paper';
import { Sale } from '../types';
import UserDetails from './common/UserDetails';

interface SaleItemProps {
    sale: Sale;
    onPress: () => void;
    onDelete: () => void;
}

const SaleItem: React.FC<SaleItemProps> = ({ sale, onPress, onDelete }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.saleCard}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.titleContainer}>
                        <Title>{sale.type}</Title>
                        <Text>
                            {sale.user && <UserDetails user={sale.user} />} {/* Use UserDetails component */}
                        </Text>
                    </View>
                    <Paragraph>{`Date: ${sale.date.toDateString()}`}</Paragraph>
                    <Paragraph>{`Quantity: ${sale.quantity}`}</Paragraph>
                    <Paragraph>{`Price Per Unit: ${sale.pricePerUnit}`}</Paragraph>
                    <Paragraph>{`Amount: ${sale.amount}`}</Paragraph>
                    {sale.description && <Paragraph>{`Description: ${sale.description}`}</Paragraph>}
                    {sale.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            <Text style={styles.tagsLabel}>Tags: </Text>
                            <View style={styles.tagChipsContainer}>
                                {sale.tags.map((tag) => (
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
    saleCard: {
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

export default SaleItem;
