import UserDetails from "./UserDetails";
import {Icon, MD3DarkTheme, MD3LightTheme} from "react-native-paper";
import {StyleSheet, TouchableOpacity, useColorScheme} from "react-native";
import React from "react";

const UserDropDownItem = ({selectedUser, setSelectedUser, setUserOpen, item}) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

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
                    color={theme.colors.onBackground}
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