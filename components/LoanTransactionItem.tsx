// src/components/LoanTransactionItem.tsx
import React from "react";
import { Card, Paragraph, Title, IconButton } from "react-native-paper";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import UserDetails from "./common/UserDetails";
import {LoanToHoldingTransaction} from "../types";

interface LoanTransactionItemProps {
    transaction: LoanToHoldingTransaction;
    onDelete: () => void; // Added onDelete prop
    onPress: () => void;
    testID?: string;
}

const LoanTransactionItem: React.FC<LoanTransactionItemProps> = ({
                                                                     transaction,
                                                                     onDelete,
                                                                     onPress
                                                                 }) => {
    const renderUserDetails = () =>
        transaction.user && <UserDetails user={transaction.user} />;

    return (
        <TouchableOpacity onPress={onPress} testID={'transaction-item'}>
            <Card style={styles.transactionCard}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.titleContainer}>
                        <View>
                            <Paragraph>{`Date: ${transaction.date.toDateString()}`}</Paragraph>
                            <Paragraph>{`Amount: ${transaction.amount}`}</Paragraph>
                        </View>
                        <Text>{renderUserDetails()}</Text>
                    </View>
                </Card.Content>
                <Card.Actions>
                    <IconButton testID={'delete'} icon="delete" onPress={onDelete} />
                </Card.Actions>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    transactionCard: {
        marginBottom: 16,
    },
    cardContent: {
        paddingHorizontal: 16,
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

});

export default LoanTransactionItem;