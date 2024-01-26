import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card, Title } from 'react-native-paper';
import commonStyles from "../components/common/commonStyles";
import {CONTAINER_PADDING} from "../constants/mybusiness.constants";

const HomeScreen = ({ navigation }) => {
    const images = [
        { uri: 'https://via.placeholder.com/300', interval: 5000 },
        { uri: 'https://via.placeholder.com/300/FF5733/FFFFFF', interval: 3000 },
        { uri: 'https://via.placeholder.com/300/33FF57/FFFFFF', interval: 7000 },
        { uri: 'https://via.placeholder.com/300/5733FF/FFFFFF', interval: 4000 },
        { uri: 'https://via.placeholder.com/300/FF33FF/FFFFFF', interval: 6000 }, // New Expense Card Image
        { uri: 'https://via.placeholder.com/300/33FFFF/FFFFFF', interval: 3000 },
        { uri: 'https://via.placeholder.com/300/33ABFF/FFFFFF', interval: 4000 }
        // Add more image URLs with different intervals as needed
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(
        Array(images.length).fill(0)
    );

    useEffect(() => {
        const intervals = images.map((image, i) =>
            setInterval(() => {
                setCurrentImageIndex((prevIndex) =>
                    prevIndex.map((index, j) =>
                        i === j ? (index === images.length - 1 ? 0 : index + 1) : index
                    )
                );
            }, image.interval)
        );

        return () => intervals.forEach((interval) => clearInterval(interval));
    }, []); // Empty dependency array

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Two Cards in One Row */}
            <View style={styles.cardsContainer}>
                <Card style={styles.card} onPress={() => navigation.navigate('RolesStack', { screen: 'Roles' })}>
                    <Card.Cover source={{ uri: images[currentImageIndex[0]].uri }} />
                    <View style={styles.textOverlay}>
                        <Title style={styles.cardTitle}>Manage Roles</Title>
                    </View>
                    <Card.Content>
                        <Text>Hello</Text>
                    </Card.Content>
                </Card>

                <View style={styles.gap} />

                <Card style={styles.card} onPress={() => navigation.navigate('Manager')}>
                    <Card.Cover source={{ uri: images[currentImageIndex[1]].uri }} />
                    <View style={styles.textOverlay}>
                        <Title style={styles.cardTitle}>Manage Manager</Title>
                    </View>
                </Card>


                <Card style={styles.card} onPress={() => navigation.navigate('ExpenseTypeStack', { screen: 'ExpenseTypes' })}>
                    <Card.Cover source={{ uri: images[currentImageIndex[2]].uri }} />
                    <View style={styles.textOverlay}>
                        <Title style={styles.cardTitle}>Expense Types</Title>
                    </View>
                </Card>
                <View style={styles.gap} />

                <Card style={styles.card} onPress={() => navigation.navigate('UsersStack', { screen: 'Users' })}>
                    <Card.Cover source={{ uri: images[currentImageIndex[3]].uri }} />
                    <View style={styles.textOverlay}>
                        <Title style={styles.cardTitle}>Manage User</Title>
                    </View>
                </Card>

                <Card style={styles.card} onPress={() => navigation.navigate('ExpenseStack', { screen: 'Expenses' })}>
                    <Card.Cover source={{ uri: images[currentImageIndex[4]].uri }} />
                    <View style={styles.textOverlay}>
                        <Title style={styles.cardTitle}>Manage Expenses</Title>
                    </View>
                </Card>
                <View style={styles.gap} />

                <Card style={styles.card} onPress={() => navigation.navigate('TagsStack', { screen: 'Tags' })}>
                    <Card.Cover source={{ uri: images[currentImageIndex[5]].uri }} />
                    <View style={styles.textOverlay}>
                        <Title style={styles.cardTitle}>Manage Tags</Title>
                    </View>
                </Card>

                <Card style={styles.card} onPress={() => navigation.navigate('WorkStack', { screen: 'WorkType' })}>
                    <Card.Cover source={{ uri: images[currentImageIndex[2]].uri }} />
                    <View style={styles.textOverlay}>
                        <Title style={styles.cardTitle}>Manage Work Type</Title>
                    </View>
                </Card>

                <View style={styles.gap} />

                <Card style={styles.card} onPress={() => navigation.navigate('WorkStack', { screen: 'Work' })}>
                    <Card.Cover source={{ uri: images[currentImageIndex[2]].uri }} />
                    <View style={styles.textOverlay}>
                        <Title style={styles.cardTitle}>Work</Title>
                    </View>
                </Card>
                <Card style={styles.card} onPress={() => navigation.navigate('SaleStack', { screen: 'Sale' })}>
                    <Card.Cover source={{ uri: images[currentImageIndex[6]].uri }} />
                    <View style={styles.textOverlay}>
                        <Title style={styles.cardTitle}>Sale</Title>
                    </View>
                </Card>

            </View>
            {/* Display amountToReceive and amountHolding */}
            <View style={styles.amountContainer}>
                <Text style={styles.amountText}>Amount To Receive: $100.00</Text>
                <Text style={styles.amountText}>Amount Holding: $50.00</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: CONTAINER_PADDING,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    card: {
        width: '48%',
        height: 175,
        marginBottom: 16,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    textOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    gap: {
        width: '4%',
    },
    amountContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    amountText: {
        marginVertical: 8,
    },
});

export default HomeScreen;
