import commonStyles from "../../src/styles/commonStyles";
import {RadioButton, Text} from "react-native-paper";
import {View} from "react-native";
import React, {useState} from "react";
import DateRangePicker from "./DateRangePicker";
import {useRecoilState} from "recoil";
import {tagsState, usersState} from "../../recoil/atom";
import {Filter, Tag, User} from "../../types";

import Labels from "./Labels";
import Button from "./Button";
import SecondaryButton from "./SecondaryButton";
import TertiaryButton from "./TertiaryButton";
import {UI_ELEMENTS_GAP} from "../../src/styles/constants";

interface FilterScreenProps {
    user: User[];
    sender: User[];
    receiver: User[];
    onApply: (arg: Filter) => void
    defaultFilter?: Filter; // Add this line to accept an optional filter prop
    onClose: () => void
}

const FilterScreen: React.FC<FilterScreenProps> = ({user, sender, receiver, onApply, defaultFilter, onClose}) => {
    const [range, setRange] = React.useState(defaultFilter ? {startDate: defaultFilter.fromDate, endDate: defaultFilter.toDate} : { startDate: undefined, endDate: undefined });
    const [selectedOption, setSelectedOption] = useState('custom');
    const [tags, setTags] = useRecoilState(tagsState);
    const [selectedTags, setSelectedTags] = useState<Tag[]>(defaultFilter ? defaultFilter.tags : []);

    const [userOpen, setUserOpen] = useState(false);
    const [allUsers, setAllUsers] = useRecoilState(usersState);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    const [selectedUsers, setSelectedUsers] = useState<User[]>(defaultFilter ? defaultFilter.user : []);
    const [selectedSenders, setSelectedSenders] = useState<User[]>(defaultFilter ? defaultFilter.sender : []);
    const [selectedReceivers, setSelectedReceivers] = useState<User[]>(defaultFilter ? defaultFilter.receiver : []);

    const handleSetRange = (value) => {
        setRange(value);
        setSelectedOption('custom')
    }

    // Function to set date range for "This month" or "This year"
    const setDefaultDateRange = (option) => {
        const today = new Date();
        let startDate, endDate;

        if (option === 'thisMonth') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = today;
        } else if (option === 'thisYear') {
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = today;
        }

        setRange({ startDate, endDate });
        setSelectedOption(option);
    };

    // Handle option change
    const handleOptionChange = (value) => {
        setSelectedOption(value);

        if (value === 'thisMonth' || value === 'thisYear') {
            setDefaultDateRange(value);
        }
    };

    const onFilterApply =  () => {
        const filter: Filter = {
            sender: selectedSenders,
            receiver: selectedReceivers,
            user: selectedUsers,
            tags: selectedTags,
            fromDate: range.startDate,
            toDate: range.endDate
        }
        onApply(filter)
    }

    const onClearAll = () => {
        const clearedState: Filter = {
            sender: [],
            receiver: [],
            user: [],
            tags: [],
            fromDate: undefined,
            toDate: undefined
        };
        setRange({ startDate: clearedState.fromDate, endDate: clearedState.toDate });
        setSelectedOption('custom');
        setSelectedTags(clearedState.tags);
        setSelectedUsers(clearedState.user);
        setSelectedSenders(clearedState.sender);
        setSelectedReceivers(clearedState.receiver);
        onApply(clearedState);
    };


    return (
        <View style={commonStyles.container}>
            <DateRangePicker range={range} setRange={handleSetRange} />
            <View style={commonStyles.elementsGap}>
                <RadioButton.Group onValueChange={handleOptionChange} value={selectedOption}>
                    <View style={commonStyles.row}>
                        <View style={{ ...commonStyles.simpleRow}}>
                            <RadioButton value="thisMonth" />
                            <Text>This month</Text>
                        </View>
                        <View style={{ ...commonStyles.simpleRow}}>
                            <RadioButton value="thisYear" />
                            <Text>This year</Text>
                        </View>
                        <View style={{ ...commonStyles.simpleRow}}>
                            <RadioButton value="custom" />
                            <Text>Custom Range</Text>
                        </View>
                    </View>
                </RadioButton.Group>
            </View>
            <Labels items={tags} label={"Tags"} setSelectedChips={setSelectedTags} selectedChips={selectedTags} />
            {user && <Labels items={user} label={"Users"} setSelectedChips={setSelectedUsers} selectedChips={selectedUsers} /> }
            {sender && (sender.length > 0) && <Labels items={sender} label={"Senders"} setSelectedChips={setSelectedSenders} selectedChips={selectedSenders} /> }
            {receiver && (receiver.length > 0) && <Labels items={receiver} label={"Receivers"} setSelectedChips={setSelectedReceivers} selectedChips={selectedReceivers} /> }
            <View style={{...commonStyles.row, ...commonStyles.elementsGap}}>
                <Button icon={'filter-check'} style={{width: '30%'}} title={'Apply'} onPress={onFilterApply}  />
                <SecondaryButton icon={'filter-remove'} style={{ width: '30%'}} title={'Clear All'} onPress={onClearAll} mode={'outlined'}  />
                <TertiaryButton icon={'close'} style={{ width: '30%'}} title={'Cancel'} onPress={onClose} mode={'outlined'}  />
            </View>
        </View>
    )
}

export default FilterScreen;
