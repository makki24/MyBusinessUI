// src/components/RoleItem.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, IconButton } from 'react-native-paper';
import { Role } from '../types';

interface RoleItemProps {
    role: Role;
    onPress: () => void;
    onDelete: () => void;
}

const RoleItem: React.FC<RoleItemProps> = ({ role, onPress, onDelete }) => (
    <TouchableOpacity onPress={onPress}>
        <Card style={styles.roleCard}>
            <Card.Content>
                <Title>{role.roleName}</Title>
            </Card.Content>
            <Card.Actions>
                <IconButton icon="delete" onPress={onDelete} />
            </Card.Actions>
        </Card>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    roleCard: {
        marginBottom: 16,
    },
});

export default RoleItem;
