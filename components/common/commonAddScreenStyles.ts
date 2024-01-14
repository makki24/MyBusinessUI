import { StyleSheet } from 'react-native';

const commonAddScreenStyles = StyleSheet.create({

    inputField: {
        marginBottom: 8,
    },
    button: {
        marginBottom: 16,
    },
    section: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    marginVerticalEight: {
        marginVertical: 8,
    },
    dropdownUserContainer: {
        marginLeft: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 10,
    },
    scrollViewContainer: {
        justifyContent: 'center',
        padding: 16,
    },
    bold: {
        fontWeight: 'bold',
    },
});

export default commonAddScreenStyles;
