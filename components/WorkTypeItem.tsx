// src/components/WorkTypeItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, IconButton } from 'react-native-paper';
import { WorkType } from '../types';
import commonItemStyles from "./common/commonItemStyles";

interface WorkTypeItemProps {
    workType: WorkType;
    onPress: (workType: WorkType) => void;
    onEdit: (workType: WorkType) => void; // New prop for the Edit action
    onDelete: () => void;
}

const WorkTypeItem: React.FC<WorkTypeItemProps> = ({ workType, onPress, onEdit, onDelete }) => (
    <TouchableOpacity onPress={() => onPress(workType)}>
        <Card style={commonItemStyles.card}>
            <Card.Content style={commonItemStyles.cardContent}>
                <Title>{workType.workTypeName}</Title>
                <Text>Default Value Per {workType.unit}: {workType.defaultValuePerUnit}</Text>
            </Card.Content>
            <Card.Actions style={commonItemStyles.cardActions}>
                {/* Edit action button */}
                <IconButton icon="pencil" onPress={() => onEdit(workType)} />

                {/* Delete action button */}
                <IconButton icon="delete" onPress={onDelete} />
            </Card.Actions>
        </Card>
    </TouchableOpacity>
);

export default WorkTypeItem;
