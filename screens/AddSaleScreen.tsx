import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, Text, View} from 'react-native';
import {Button, TextInput} from 'react-native-paper';

import {salesState, tagsState, usersState, userState} from '../recoil/atom';
import saleService from '../services/SaleService';
import {Sale, SaleType, Tag as Tags, User} from '../types';
import CustomDropDown from '../components/common/CustomDropdown';
import {useRecoilState} from "recoil";
import DateTimePicker from "../components/common/DateTimePicker";
import UserDropDownItem from "../components/common/UserDropDownItem";
import SwitchInput from "../components/common/SwitchInput";
import commonAddScreenStyles from "../components/common/commonAddScreenStyles";
import commonStyles from "../components/common/commonStyles";

interface AddSaleScreenProps {
    navigation: any;
    route: {
        params: {
            isEditMode: boolean;
            sale: Sale;
        }
    };
}

const AddSaleScreen: React.FC<AddSaleScreenProps> = ({ route, navigation }) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [tagOpen, setTagOpen] = useState(false);
    const [typeOpen, setTypeOpen] = useState(false);
    const [saleType, setSaleType] = useState<SaleType>(SaleType.type2);
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
    const [tags, setTags] = useRecoilState(tagsState);
    const [sales, setSales] = useRecoilState(salesState);
    const [loggedInUser, setLoggedInUser] = useRecoilState(userState);
    const [isEdit, setIsEdit] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
    const [userOpen, setUserOpen] = useState(false);
    const [allUsers, setAllUsers] = useRecoilState(usersState);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [showAmount, setShowAmount] = useState(false);


    useEffect(() => {
        if (route.params?.isEditMode && route.params?.sale) {
            setIsEdit(true);
            const extractedSale = route.params.sale;
            const paramDate = new Date(extractedSale.date)

            setQuantity(`${extractedSale.quantity}`);
            setPricePerUnit(`${extractedSale.pricePerUnit}`);
            setDescription(extractedSale.description)
            setSelectedTags(extractedSale.tags.map(tag => tag.id))
            setInputDate(paramDate);
            setSelectedUser(extractedSale.user.id);
            setTime({hours: paramDate.getHours(), minutes: paramDate.getMinutes()});

            if(!extractedSale.pricePerUnit)
                setShowAmount(true);
            // Logic to set state based on provided sale data
            // ...
        }
    }, [route.params?.isEditMode, route.params?.sale]);

    const handleTagChange = (tag: string | null) => {
        // Handle tag change logic if needed
        // ...
    };

    const submitSale = async () => {
        setError('');
        try {
            setIsLoading(true);
            const saleDate = new Date(inputDate);
            saleDate.setHours(time.hours, time.minutes);
            let calculatedAmount;
            if (showAmount) {
                calculatedAmount = parseFloat(amount);
                setQuantity('1');
            }
            else {
                calculatedAmount = parseFloat(quantity )* parseFloat(pricePerUnit);
            }

            let newSale: Sale = {
                user: {id: selectedUser} as User,
                date: saleDate,
                type: saleType,
                amount: calculatedAmount,
                quantity: parseFloat(quantity ),
                pricePerUnit: parseFloat(pricePerUnit),
                description: description,
                tags: selectedTags.map(tag => ({ id: tag })) as Tags[],
            }

            if(isEdit)
                newSale.id = route.params.sale.id;

            // Logic to submit sale data
            // ...
            newSale = await saleService.addSale(newSale);
            newSale.date = new Date(newSale.date);

            setSales((prevWorks) => [...prevWorks.filter((sale) => sale.id !== newSale.id), newSale]);



            // Reset state variables after submitting sale
            // ...
            setQuantity('');
            setPricePerUnit('');
            setAmount('');
            setDescription('');

            navigation.goBack();
        } catch (err) {
            console.error('Error adding sale:', err);
            setError(err.message ?? 'An error occurred while adding the sale');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSale = () => {
        // Logic to validate and add sale
        // ...
        if (!selectedUser) {
            setError("User is required");
            return;
        }
        if (!showAmount && (!pricePerUnit || !quantity)) {
            setError('Price per unit and quantity are required');
            return;
        }

        if (showAmount && (!amount)) {
            setError("Amount is required");
            return;
        }


        submitSale();
    };

    return (
        <ScrollView contentContainerStyle={commonAddScreenStyles.scrollViewContainer}>
            {isLoading && (
                <View style={commonStyles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}

            {error && (
                <View style={commonStyles.errorContainer}>
                    <Text style={commonStyles.errorText}>{error}</Text>
                </View>
            )}

            <View style={{...commonStyles.row, justifyContent: 'space-between',}}>
                <SwitchInput label={'Enter amount directly'} value={showAmount} onValueChange={(showAmount) => {
                    if (showAmount) {
                        setPricePerUnit(null);
                    }
                    setShowAmount(showAmount)
                }
                }/>
            </View>

            <CustomDropDown
                schema={{
                    label: 'label',
                    value: 'value',
                }}
                items={[
                    { label: 'Sales', value: SaleType.sales },
                    { label: 'Type 2', value: SaleType.type2 },
                ]}
                zIndex={3000}
                zIndexInverse={3000}
                open={typeOpen}
                setOpen={setTypeOpen}
                containerStyle={{ height: 40, marginBottom: 16 }}
                value={saleType}
                setValue={setSaleType}
                itemSeparator={true}
                placeholder="Select Sale Type"
            />

            <CustomDropDown
                schema={{
                    label: 'username',
                    value: 'id',
                }}
                zIndex={2000}
                zIndexInverse={2000}
                items={allUsers.filter(user => (user.phoneNumber || user.email) && user.email !== loggedInUser.email)}
                searchable={true}
                open={userOpen}
                setOpen={setUserOpen}
                containerStyle={{ height: 40, marginBottom: 16 }}
                value={selectedUser}
                setValue={setSelectedUser}
                itemSeparator={true}
                placeholder="Select User"
                renderListItem={({item}) => (
                    <UserDropDownItem item={item} setSelectedUser={setSelectedUser} selectedUser={selectedUser} setUserOpen={setUserOpen} />
                )}
            />

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

            {showAmount && <TextInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={commonAddScreenStyles.inputField} />}


            {!showAmount && <TextInput label="Price per unit" value={pricePerUnit} onChangeText={setPricePerUnit} keyboardType="numeric" style={commonAddScreenStyles.inputField} />}

            {!showAmount && <TextInput label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" style={commonAddScreenStyles.inputField} />}

            <TextInput label="Description (optional)" value={description} onChangeText={setDescription} style={commonAddScreenStyles.inputField} />

            {/* Time picker */}
            <DateTimePicker
                label="Date"
                dateValue={inputDate}
                onDateChange={setInputDate}
                onTimeChange={setTime}
                timeValue={time}
            />

            <Button mode="contained" onPress={handleAddSale}>
                {route.params?.isEditMode ? 'Save Sale' : 'Add Sale'}
            </Button>
        </ScrollView>
    );
};

export default AddSaleScreen;
