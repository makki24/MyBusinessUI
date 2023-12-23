import UserDetails from "./UserDetails";
import {Icon} from "react-native-paper";
import {StyleSheet, TouchableOpacity} from "react-native";
import React from "react";

const UserDropDownItem = ({selectedUser, setSelectedUser, setUserOpen, item}) => {
    return (
        <TouchableOpacity onPress={() => {
            setSelectedUser(item.id)
            setUserOpen(false)
        }}
                          style={styles.dropdownUserContainer}
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
    )
}

const styles = StyleSheet.create({
    dropdownUserContainer: {
        marginLeft: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 10
    }
})
export default UserDropDownItem;