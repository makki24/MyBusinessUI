// src/components/UserItem.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Card, Paragraph, IconButton } from "react-native-paper";
import { User } from "../types";
import UserDetails from "./common/UserDetails";
import commonItemStyles from "../src/styles/commonItemStyles";
import { useRecoilValue } from "recoil";
import { isAdmin } from "../recoil/selectors";
import UserRemainingAmount from "../src/components/common/UserRemainingAmount";

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
  const isUserAdmin = useRecoilValue(isAdmin);

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={commonItemStyles.card}>
        <Card.Content style={commonItemStyles.cardContent}>
          <View style={commonItemStyles.titleContainer}>
            <UserRemainingAmount user={user} />
            <TouchableOpacity onPress={onEdit}>
              <UserDetails user={user} />
            </TouchableOpacity>
          </View>
          <Paragraph>{user.email}</Paragraph>
          <Paragraph>{`Phone: ${user.phoneNumber}`}</Paragraph>
        </Card.Content>
        {isUserAdmin && (
          <Card.Actions style={commonItemStyles.cardActionsWithTags}>
            <IconButton icon="delete" onPress={onDelete} />
          </Card.Actions>
        )}
      </Card>
    </TouchableOpacity>
  );
};

export default UserItem;
