import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useRecoilState } from 'recoil';
import { Button, TextInput, Icon } from 'react-native-paper';

import {userState, usersState, tagsState, worksState} from '../recoil/atom';
import WorkService from '../services/WorkService';
import UserService from '../services/UserService';
import {WorkType, Tag as Tags, User, Work} from '../types';
import CustomDropDown from '../components/common/CustomDropdown';
import TagsService from '../services/TagsService';
import SwitchInput from "../components/common/SwitchInput";
import UserDetails from "../components/common/UserDetails";
import DateTimePicker from "../components/common/DateTimePicker";
import commonAddScreenStyles from "../components/common/commonAddScreenStyles";
import commonStyles from "../components/common/commonStyles";
import LoadingError from "../components/common/LoadingError";

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
            setWorkType(work.type);
            setPricePerUnit(`${work.pricePerUnit}`);
            setAmount(`${work.amount}`);
            setDescription(work.description);
            setInputDate(paramDate);
            setSelectedTags(work.tags.map(tag => tag.id))
            setSelectedUser(work.user.id)
            setTime({hours: paramDate.getHours(), minutes: paramDate.getMinutes()});
            if(work.pricePerUnit && (work.pricePerUnit !== work.type.defaultValuePerUnit))
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
            setIsDataLoading(true);
            const fetchedTags = await TagsService.getTags();
            setTags(fetchedTags);
        } catch (error) {
            setError(error.message || 'Error getting tags');
        }
        finally {
            setIsDataLoading(false)
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchTags();
    }, []);

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
                type: workType,
                quantity: parseInt(quantity),
                pricePerUnit: parseFloat(pricePerUnit),
                amount: calculatedAmount,
                description,
                user: selectedUser ? { id: selectedUser } as User : null,
                tags: selectedTags.map(tag => ({ id: tag })) as Tags[],
            }

            if (isEdit) {
                newWork.id = route.params.work.id;
            }

            newWork = await WorkService.addWork(newWork);

            newWork.date = new Date(newWork.date);
            setAllWorks((prevWorks) => [...prevWorks.filter((wt) => wt.id !== newWork.id), newWork]);

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
        <ScrollView contentContainerStyle={commonAddScreenStyles.scrollViewContainer}>
            <LoadingError error={error} isLoading={isLoading} />

            {/* Switch to show/hide Price per unit field */}
            <View style={{...commonStyles.row, justifyContent: 'space-between',}}>
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
                        label: 'name',
                        value: 'id',
                    }}
                    zIndex={2000}
                    zIndexInverse={2000}
                    items={users.filter(user => (user.phoneNumber || user.email) && user.email !== loggedInUser.email)}
                    searchable={true}
                    open={userOpen}
                    setOpen={setUserOpen}
                    containerStyle={{ height: 40, marginBottom: 16 }}
                    value={selectedUser}
                    setValue={handleUserChange}
                    itemSeparator={true}
                    placeholder="Select User"
                    onChangeValue={handleUserChange}
                    renderListItem={({item}) => (
                        <TouchableOpacity onPress={() => {
                            setSelectedUser(item.id)
                            setUserOpen(false)
                        }}
                          style={commonAddScreenStyles.dropdownUserContainer}
                        >
                            <UserDetails user={item}/>
                            {(selectedUser === item.id) &&
                                <Icon
                                    source="check"
                                    color={'primary'}
                                    size={20}
                                />
                            }
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* New selector for tags */}
            <CustomDropDown
                multiple={true}
                items={tags}
                zIndex={1000}
                zIndexInverse={1000}
                schema={{
                    label: 'name',
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
                <TextInput label="Price per unit" value={pricePerUnit} onChangeText={setPricePerUnit} keyboardType="numeric" style={commonAddScreenStyles.inputField} />
            )}

            {!showAmount && (
                <TextInput label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" style={commonAddScreenStyles.inputField} />
            )}

            {showAmount && <TextInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={commonAddScreenStyles.inputField} />}

            <TextInput label="Description (optional)" value={description} onChangeText={setDescription} style={commonAddScreenStyles.inputField} />

            {/* Time picker */}
            <DateTimePicker
                label="Work date"
                dateValue={inputDate}
                onDateChange={setInputDate}
                onTimeChange={setTime}
                timeValue={time}
            />

            {/* Button to add the work */}
            <Button mode="contained" onPress={handleAddWork}>
                {isEdit ? 'Save Work': "Add Work"}
            </Button>
        </ScrollView>
    );
};

export default AddWorkScreen;
