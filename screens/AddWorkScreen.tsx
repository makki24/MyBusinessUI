import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Button, TextInput, Modal as PaperModal, Portal } from 'react-native-paper';
import { DatePickerInput, TimePickerModal } from 'react-native-paper-dates';

import {userState, usersState, tagsState, worksState} from '../recoil/atom';
import WorkService from '../services/WorkService';
import UserService from '../services/UserService';
import {WorkType, Tag as Tags, User, Work} from '../types';
import CustomDropDown from '../components/common/CustomDropdown';
import TagsService from '../services/TagsService';
import SwitchInput from "../components/common/SwitchInput";

interface AddWorkScreenProps {
    navigation: any;
    route: {
        params: {
            isEditMode: boolean;
            workType: WorkType
            work: Work
        }
    };
}

const AddWorkScreen: React.FC<AddWorkScreenProps> = ({ route, navigation }) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [tagOpen, setTagOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [workType, setWorkType] = useState<WorkType>(null);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [quantity, setQuantity] = useState('');
    const [pricePerUnit, setPricePerUnit] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [inputDate, setInputDate] = useState(new Date());
    const [time, setTime] = useState<{ hours: number | undefined; minutes: number | undefined }>({
        hours: new Date().getHours(),
        minutes: new Date().getMinutes(),
    });
    const [timeOpen, setTimeOpen] = useState(false);
    const [users, setUsers] = useRecoilState(usersState);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [tags, setTags] = useRecoilState(tagsState);
    const [loggedInUser, setLoggedInUser] = useRecoilState(userState);
    const [showPricePerUnit, setShowPricePerUnit] = useState(false);
    const [showAmount, setShowAmount] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
    const [allWorks, setAllWorks] = useRecoilState(worksState);


    useEffect(() => {
        // Check if the screen is in edit mode and workType data is provided
        if (route.params?.workType) {
            setWorkType(route.params.workType);
            setPricePerUnit(`${route.params.workType.defaultValuePerUnit}`)
        }
    }, [route.params?.workType]);

    useEffect(() => {
        // Check if the screen is in edit mode and workType data is provided
        if (route.params?.isEditMode && route.params?.work) {
            setIsEdit(true);
            const work = route.params.work as Work;
            const paramDate = new Date(work.date)

            setQuantity(`${work.quantity}`);
            setWorkType(work.workType);
            setPricePerUnit(`${work.pricePerUnit}`);
            setAmount(`${work.amount}`);
            setDescription(work.description);
            setInputDate(paramDate);
            setSelectedTags(work.tags.map(tag => tag.id))
            setSelectedUser(work.user.id)
            setTime({hours: paramDate.getHours(), minutes: paramDate.getMinutes()});
            if(work.pricePerUnit && (work.pricePerUnit !== work.workType.defaultValuePerUnit))
                setShowPricePerUnit(true);
            if (!work.pricePerUnit) {
                setShowAmount(true);
            }

        }
    }, [route.params?.isEditMode, route.params?.work]);

    const fetchUsers = async () => {
        try {
            const fetchedUsers = await UserService.getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.message || 'Error getting tags');
        }
    };

    const fetchTags = async () => {
        try {
            const fetchedTags = await TagsService.getTags();
            setTags(fetchedTags);
            setIsDataLoading(true)
        } catch (error) {
            setError(error.message || 'Error getting tags');
        }
    };

    const onConfirmTime = useCallback(
        ({ hours, minutes }: any) => {
            setTimeOpen(false);
            setTime({ hours, minutes });
        },
        [setTimeOpen, setTime]
    );


    const onDismissTime = useCallback(() => {
        setTimeOpen(false);
    }, [setTimeOpen]);

    const timeFormatter = React.useMemo(
        () =>
            new Intl.DateTimeFormat('en', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }),
        []
    );

    useEffect(() => {
        fetchUsers();
        fetchTags();
    }, []);

    const maxFontSizeMultiplier = 1.5;
    let timeDate = new Date();
    time.hours !== undefined && timeDate.setHours(time.hours);
    time.minutes !== undefined && timeDate.setMinutes(time.minutes);

    const handleTagChange = (tag: string | null) => {
        // Handle tag change logic if needed
    };

    const handleUserChange = (user: string | null) => {
        if (user) setSelectedUser(user);
    };

    const submitWork = async () => {
        try {
            setIsLoading(true);
            const workDate = new Date(inputDate);
            workDate.setHours(time.hours, time.minutes);
            let calculatedAmount = parseFloat(amount);

            if (!showAmount) {
                // Calculate amount based on Price per unit and Quantity
                if (pricePerUnit) {
                    calculatedAmount = parseFloat(pricePerUnit) * parseInt(quantity);
                }
            }
            else {
               setPricePerUnit(null);
            }

            let newWork: Work = {
                date: workDate,
                workType: workType,
                quantity: parseInt(quantity),
                pricePerUnit: parseFloat(pricePerUnit),
                amount: calculatedAmount,
                description,
                user: selectedUser ? { id: selectedUser } as User : null,
                tags: selectedTags.map(tag => ({ id: tag })) as Tags[],
            }

            if (isEdit) {
                newWork.workID = route.params.work.workID;
            }

            newWork = await WorkService.addWork(newWork);

            newWork.date = new Date(newWork.date);
            setAllWorks((prevWorks) => [...prevWorks.filter((wt) => wt.workID !== newWork.workID), newWork]);

            // Add logic to update Recoil state or other actions based on the new work

            setQuantity('');
            setWorkType(null);
            setPricePerUnit('');
            setAmount('');
            setDescription('');

            navigation.goBack();
        } catch (err) {
            console.error('Error adding work:', err);
            setError(err.message ?? 'An error occurred while adding the work');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddWork = () => {
        if (!selectedUser) {
            setError("User is required");
            return;
        }
        if (!showAmount && (!workType || !quantity)) {
            setError('Work type and quantity are required');
            return;
        }

        submitWork();
    };

    // Component rendering
    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            {/* Loading indicator */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}

            {/* Error message display */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Switch to show/hide Price per unit field */}
            <View style={{...styles.row, justifyContent: 'space-between',}}>
                <SwitchInput label={'Show Price per unit'} value={showPricePerUnit} onValueChange={(value) => {
                    if(value)
                        setShowAmount(false);
                    setShowPricePerUnit(value)
                  }
                } />
                <SwitchInput label={'Enter amount directly'} value={showAmount} onValueChange={(showAmount) => {
                    if (showAmount) {
                        setShowPricePerUnit(false);
                        setQuantity(`1`);
                    }
                    setShowAmount(showAmount)
                  }
                }/>
            </View>

            {/* Additional selector for users if required */}
            {workType && (
                <CustomDropDown
                    schema={{
                        label: 'username',
                        value: 'id',
                    }}
                    zIndex={2000}
                    zIndexInverse={2000}
                    items={users.filter(user => user.email !== loggedInUser.email)}
                    searchable={true}
                    open={userOpen}
                    setOpen={setUserOpen}
                    containerStyle={{ height: 40, marginBottom: 16 }}
                    value={selectedUser}
                    setValue={handleUserChange}
                    itemSeparator={true}
                    placeholder="Select User"
                    onChangeValue={handleUserChange}
                />
            )}

            {/* New selector for tags */}
            <CustomDropDown
                multiple={true}
                items={tags}
                zIndex={1000}
                zIndexInverse={1000}
                schema={{
                    label: 'tagName',
                    value: 'id',
                }}
                open={tagOpen}
                setOpen={setTagOpen}
                containerStyle={{ height: 40, marginBottom: 16 }}
                value={selectedTags}
                setValue={setSelectedTags}
                itemSeparator={true}
                placeholder="Select Tags"
                onChangeValue={handleTagChange}
                loading={isDataLoading}
            />

            {/* Input fields for quantity, price per unit, amount, and description */}
            {showPricePerUnit && (
                <TextInput label="Price per unit" value={pricePerUnit} onChangeText={setPricePerUnit} keyboardType="numeric" style={styles.inputField} />
            )}

            {!showAmount && (
                <TextInput label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" style={styles.inputField} />
            )}

            {showAmount && <TextInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.inputField} />}

            <TextInput label="Description (optional)" value={description} onChangeText={setDescription} style={styles.inputField} />

            {/* Date picker */}
            <DatePickerInput
                locale="en"
                label="Work date"
                value={inputDate}
                onChange={(d) => setInputDate(d || new Date())}
                inputMode="start"
                style={styles.inputField}
            />

            {/* Time picker */}
            <View style={[styles.row, styles.marginVerticalEight]}>
                <View style={styles.section}>
                    <Text maxFontSizeMultiplier={maxFontSizeMultiplier} style={styles.bold}>
                        Time
                    </Text>
                    <Text maxFontSizeMultiplier={maxFontSizeMultiplier}>
                        {time && time.hours !== undefined && time.minutes !== undefined
                            ? timeFormatter.format(new Date().setHours(time.hours, time.minutes))
                            : `Current Time: ${timeFormatter.format(new Date())}`}
                    </Text>
                </View>
                <Button onPress={() => setTimeOpen(true)} uppercase={false} mode="contained-tonal">
                    Pick time
                </Button>
            </View>

            {/* Time picker modal */}
            <TimePickerModal
                locale={'en'}
                visible={timeOpen}
                onDismiss={onDismissTime}
                onConfirm={onConfirmTime}
                hours={time.hours}
                minutes={time.minutes}
            />

            {/* Button to add the work */}
            <Button mode="contained" onPress={handleAddWork}>
                {isEdit ? 'Save Work': "Add Work"}
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContainer: {
        justifyContent: 'center',
        padding: 16,
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
    bold: {
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
    },
    section: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    marginVerticalEight: {
        marginVertical: 8,
    },
    inputField: {
        marginBottom: 8,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignSelf: 'center', // Center the modal on the screen
        width: '80%', // Set the width to a percentage of the screen width
    },
    modalButtonGap: {
        height: 5,
    }
});

export default AddWorkScreen;
