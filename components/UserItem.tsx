// src/components/UserItem.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Card, Paragraph, IconButton } from "react-native-paper";
import { User } from "../types";
import UserDetails from "./common/UserDetails";
import commonItemStyles from "../src/styles/commonItemStyles";

interface UserItemProps {
  user: User;
  onPress: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  onPress,
  onDelete,
  onEdit,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={commonItemStyles.card}>
        <Card.Content style={commonItemStyles.cardContent}>
          <View style={commonItemStyles.titleContainer}>
            <View>
              <Paragraph>{user.email}</Paragraph>
              <Paragraph>{`Phone: ${user.phoneNumber}`}</Paragraph>
            </View>
            <TouchableOpacity onPress={onEdit}>
              <UserDetails user={user} />
            </TouchableOpacity>
          </View>
          <Paragraph>{`Amount to Receive: ${user.amountToReceive}`}</Paragraph>
          <Paragraph>{`Amount Holding: ${user.amountHolding}`}</Paragraph>
          {/* Display additional user information as needed */}
        </Card.Content>
        <Card.Actions style={commonItemStyles.cardActionsWithTags}>
          <IconButton icon="delete" onPress={onDelete} />
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  );
};

export default UserItem;
