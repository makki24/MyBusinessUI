import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card, Title } from 'react-native-paper';
import homeScreenStyles from "../src/styles/homeScreenStyles";

const HomeScreen = ({ navigation }) => {
    const images = [
        { uri: 'https://via.placeholder.com/300', interval: 5000 },
        { uri: 'https://via.placeholder.com/300/FF5733/FFFFFF', interval: 3000 },
        { uri: 'https://via.placeholder.com/300/33FF57/FFFFFF', interval: 7000 },
        { uri: 'https://via.placeholder.com/300/5733FF/FFFFFF', interval: 4000 },
        { uri: 'https://via.placeholder.com/300/FF33FF/FFFFFF', interval: 6000 }, // New Expense Card Image
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
        <ScrollView contentContainerStyle={homeScreenStyles.container}>
            {/* Two Cards in One Row */}
            <View style={homeScreenStyles.cardsContainer}>
                <Card style={homeScreenStyles.card} onPress={() => navigation.navigate('WorkStack', { screen: 'Work' })}>
                    <Card.Cover source={require('../assets/work.jpeg')} />
                    <View style={homeScreenStyles.textOverlay}>
                        <Title style={homeScreenStyles.cardTitle}>Work</Title>
                    </View>
                </Card>

                <View style={homeScreenStyles.gap} />

                <Card style={homeScreenStyles.card} onPress={() => navigation.navigate('SaleStack', { screen: 'Sale' })}>
                    <Card.Cover source={require('../assets/sale.jpeg')}/>
                    <View style={homeScreenStyles.textOverlay}>
                        <Title style={homeScreenStyles.cardTitle}>Sale</Title>
                    </View>
                </Card>


                <Card style={homeScreenStyles.card} onPress={() => navigation.navigate('ExpenseStack', { screen: 'Expenses' })}>
                    <Card.Cover source={require('../assets/expense.jpeg')} />
                    <View style={homeScreenStyles.textOverlay}>
                        <Title style={homeScreenStyles.cardTitle}>Manage Expenses</Title>
                    </View>
                </Card>
                <View style={homeScreenStyles.gap} />

                <Card style={homeScreenStyles.card} onPress={() => navigation.navigate('UsersStack', { screen: 'Users' })}>
                    <Card.Cover source={require('../assets/user.jpeg')} />
                    <View style={homeScreenStyles.textOverlay}>
                        <Title style={homeScreenStyles.cardTitle}>Manage User</Title>
                    </View>
                </Card>

                {/* Admin Card */}
                <Card style={homeScreenStyles.card} onPress={() => navigation.navigate('HomeStack', { screen: 'AdminScreen', params: {title: 'Admin' }})}>
                    <Card.Cover source={require('../assets/admin.jpeg')} />
                    <View style={homeScreenStyles.textOverlay}>
                        <Title style={homeScreenStyles.cardTitle}>Admin</Title>
                    </View>
                </Card>

                <View style={homeScreenStyles.gap} />
            </View>
        </ScrollView>
    );
};

export default HomeScreen;
