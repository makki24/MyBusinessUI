// src/components/UserItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {Card, Title, Avatar, Paragraph, IconButton} from 'react-native-paper';
import { User } from '../types';
import UserDetails from "./common/UserDetails";

interface UserItemProps {
    user: User;
    onPress: () => void;
    onDelete: () => void,
    onEdit: () => void
}

const UserItem: React.FC<UserItemProps> = ({ user, onPress, onDelete, onEdit }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.userCard}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.titleContainer}>
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
                <Card.Actions style={styles.cardActions}>
                    <IconButton icon="delete" onPress={onDelete} />
                </Card.Actions>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    userCard: {
        marginBottom: 16,
    },
    cardContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        justifyContent: 'space-between'
    },
    cardActions: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
});

export default UserItem;
