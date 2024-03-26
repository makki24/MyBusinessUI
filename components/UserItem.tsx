// src/components/UserItem.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import {
  Card,
  Paragraph,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { User } from "../types";
import UserDetails from "./common/UserDetails";
import commonItemStyles from "../src/styles/commonItemStyles";
import { useRecoilValue } from "recoil";
import { isAdmin } from "../recoil/selectors";

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
  const amount = Math.abs(user.amountToReceive - user.amountHolding);
  const toRecieve = user.amountHolding > user.amountToReceive;
  const theme = useTheme();
  const isUserAdmin = useRecoilValue(isAdmin);

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={commonItemStyles.card}>
        <Card.Content style={commonItemStyles.cardContent}>
          <View style={commonItemStyles.titleContainer}>
            <View>
              <Text
                variant={"titleLarge"}
                style={{
                  color: toRecieve ? theme.colors.primary : theme.colors.error,
                }}
              >
                {amount}
              </Text>
            </View>
            <TouchableOpacity onPress={onEdit}>
              <UserDetails user={user} />
            </TouchableOpacity>
          </View>
          <Paragraph>{user.email}</Paragraph>
          <Paragraph>{`Phone: ${user.phoneNumber}`}</Paragraph>
          {/*<Paragraph>{`Amount to Receive: ${user.amountToReceive}`}</Paragraph>*/}
          {/*<Paragraph>{`Amount Holding: ${user.amountHolding}`}</Paragraph>*/}
          {/* Display additional user information as needed */}
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
