// src/components/RoleItem.tsx

import React from "react";
import { TouchableOpacity } from "react-native";
import { Card, Title, IconButton } from "react-native-paper";
import { Role } from "../types";
import commonItemStyles from "../src/styles/commonItemStyles";

interface RoleItemProps {
  role: Role;
  onPress: () => void;
  onDelete: () => void;
}

const RoleItem: React.FC<RoleItemProps> = ({ role, onPress, onDelete }) => (
  <TouchableOpacity onPress={onPress} testID="role-card">
    <Card style={commonItemStyles.card}>
      <Card.Content style={commonItemStyles.cardContent}>
        <Title>{role.name}</Title>
      </Card.Content>
      <Card.Actions style={commonItemStyles.cardActionsWithTags}>
        <IconButton icon="delete" onPress={onDelete} testID="delete-button" />
      </Card.Actions>
    </Card>
  </TouchableOpacity>
);

export default RoleItem;
