import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card, Title } from 'react-native-paper';

const HomeScreen = ({ navigation }) => {
    const images = [
        { uri: 'https://via.placeholder.com/300', interval: 5000 }, // 5 seconds
        { uri: 'https://via.placeholder.com/300/FF5733/FFFFFF', interval: 3000 }, // 3 seconds
        { uri: 'https://via.placeholder.com/300/33FF57/FFFFFF', interval: 7000 }, // 7 seconds
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
                <Card
                    style={styles.card}
                    onPress={() => navigation.navigate('Roles')}
                >
                    <Card.Cover
                        source={{ uri: images[currentImageIndex[0]].uri }}
                    />
                    <View style={styles.textOverlay}>
                        <Title style={styles.cardTitle}>Manage Roles</Title>
                    </View>
                    <Card.Content>
                        <Text>Hello</Text>
                    </Card.Content>
                </Card>

                <View style={styles.gap} />

                <Card
                    style={styles.card}
                    onPress={() => navigation.navigate('Manager')}
                >
                    <Card.Cover
                        source={{ uri: images[currentImageIndex[1]].uri }}
                    />
                    <View style={styles.textOverlay}>
                        <Title style={styles.cardTitle}>Manage Manager</Title>
                    </View>
                </Card>
            </View>

            {/* Third Card Below the First Card */}
            <Card
                style={styles.card}
                onPress={() => navigation.navigate('User')}
            >
                <Card.Cover
                    source={{ uri: images[currentImageIndex[2]].uri }}
                />
                <View style={styles.textOverlay}>
                    <Title style={styles.cardTitle}>Manage User</Title>
                </View>
            </Card>

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
        padding: 16,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow cards to wrap to the next line
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    card: {
        width: '48%',
        height: 175, // Adjust the height as needed
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
        color: '#fff', // Text color for overlay
    },
    gap: {
        width: '4%', // Adjust the gap width as needed
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
