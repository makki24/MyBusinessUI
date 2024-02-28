import UserDetails from "./UserDetails";
import {Icon, MD3DarkTheme, MD3LightTheme} from "react-native-paper";
import {StyleSheet, TouchableOpacity, useColorScheme} from "react-native";
import React from "react";
import commonAddScreenStyles from "../../src/styles/commonAddScreenStyles";

const UserDropDownItem = ({selectedUser, setSelectedUser, setUserOpen, item}) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

    return (
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
                    color={theme.colors.onBackground}
                    size={20}
                />
            }
        </TouchableOpacity>
    )
}

export default UserDropDownItem;