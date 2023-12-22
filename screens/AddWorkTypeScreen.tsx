// src/screens/AddWorkTypeScreen.tsx
import React, {useEffect, useState} from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useRecoilState } from 'recoil';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { workTypesState } from '../recoil/atom'; // Adjust the path accordingly
import { WorkType } from '../types';
import WorkService from "../services/WorkService";

interface AddWorkTypeScreenProps {
    route: {
        params: {
            workType: WorkType,
            isEditMode: boolean
        }
    };
    navigation: any; // Adjust the type based on your navigation prop type
}

const AddWorkTypeScreen: React.FC<AddWorkTypeScreenProps> = ({ route, navigation }) => {
    const [typeName, setTypeName] = useState('');
    const [unit, setUnit] = useState('');
    const [defaultPrice, setDefaultPrice] = useState('');
    const [workTypes, setWorkTypes] = useRecoilState(workTypesState); // Adjust the atom accordingly
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        // Check if the screen is in edit mode and workType data is provided
        if (route.params?.isEditMode && route.params?.workType) {
            setIsEdit(true);
            const workType = route.params.workType;
            setTypeName(workType.workTypeName);
            setUnit(workType.unit);
            setDefaultPrice(workType.defaultValuePerUnit.toString());
            // ... set other state variables with workType data
        }
    }, [route.params?.isEditMode, route.params?.workType]);

    const handleAddWorkType = async () => {
        try {
            if (!typeName || !defaultPrice || !unit) {
                setError('Type name, unit and default price cannot be empty'); // Set the error message
                return;
            }

            setIsLoading(true); // Set loading to true

            // Call your API service to add a new work type

            let newWorkType: WorkType = {
                workTypeName: typeName,
                defaultValuePerUnit: parseFloat(defaultPrice),
                unit: unit
            }

            if (isEdit) {
                newWorkType.id = route.params.workType.id;
            }

            newWorkType = await WorkService.addWorkType(newWorkType);

            // Update Recoil state with the new work type
            setWorkTypes((prevWorkTypes) => [...prevWorkTypes.filter(workType => workType.id !== newWorkType.id), newWorkType]);

            // Navigate back to the Work Types screen
            navigation.goBack();
        } catch (error) {
            console.error('Error adding work type:', error);
            setError(error.message || 'An error occurred'); // Set the error message
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
            placeholder="Enter type name"
            value={typeName}
            onChangeText={setTypeName}
        />
        <Input
            placeholder="Enter default price"
            value={defaultPrice}
            onChangeText={setDefaultPrice}
            keyboardType="numeric"
        />
         <Input
             placeholder="Enter unit"
             value={unit}
             onChangeText={setUnit}
         />
        <Button title={isEdit ? 'Save Work Type': "Add Work Type"} onPress={handleAddWorkType} />
    </View>);
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

export default AddWorkTypeScreen;
