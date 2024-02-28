import { StyleSheet } from 'react-native';
import {CONTAINER_PADDING, UI_ELEMENTS_GAP} from "./constants";

const commonAddScreenStyles = StyleSheet.create({

    inputField: {
        marginBottom: UI_ELEMENTS_GAP,
    },
    button: {
        marginBottom: CONTAINER_PADDING,
    },
    section: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    marginVerticalEight: {
        marginVertical: UI_ELEMENTS_GAP,
    },
    dropdownUserContainer: {
        marginLeft: UI_ELEMENTS_GAP,  // WHERE IS IT IMPACTING ?
        paddingVertical: UI_ELEMENTS_GAP,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: UI_ELEMENTS_GAP,
    },
    scrollViewContainer: {
        justifyContent: 'center',
        padding: CONTAINER_PADDING,
    },
    bold: {
        fontWeight: 'bold',
    },
});

export default commonAddScreenStyles;
