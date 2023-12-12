// src/screens/AddTagScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useRecoilState } from 'recoil';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import TagsService from "../services/TagsService"; // Adjust the path accordingly
import { tagsState } from '../recoil/atom'; // Adjust the path accordingly
import { Tag } from '../types'; // Adjust the path accordingly

interface AddTagScreenProps {
    navigation: any; // Adjust the type based on your navigation prop type
}

const AddTagScreen: React.FC<AddTagScreenProps> = ({ navigation }) => {
    const [tagName, setTagName] = useState('');
    const [tags, setTags] = useRecoilState(tagsState);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddTag = async () => {
        try {
            if (!tagName) {
                setError('Tag name cannot be empty'); // Set the error message
                return;
            }

            setIsLoading(true); // Set loading to true

            // Call your API service to add a new tag
            const newTag = await TagsService.addTag({ tagName });

            // Update Recoil state with the new tag
            setTags((prevTags) => [...prevTags, newTag]);

            // Navigate back to the Tags screen
            navigation.goBack();
        } catch (error) {
            console.error('Error adding tag:', error);
            setError(error.response?.message || 'An error occurred'); // Set the error message
        } finally {
            setIsLoading(false); // Set loading to false regardless of success or failure
        }
    };

    return (
        <View style={styles.container}>
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Text>
                        <ActivityIndicator size="large" color="#0000ff" /> {/* Show spinner if loading */}
                    </Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <Input
                placeholder="Enter tag name"
                value={tagName}
                onChangeText={setTagName}
            />
            <Button title="Add Tag" onPress={handleAddTag} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    errorContainer: {
        backgroundColor: 'red',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'white',
    },
});

export default AddTagScreen;
