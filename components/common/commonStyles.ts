import {StyleSheet} from "react-native";
import {CONTAINER_PADDING, UI_ELEMENTS_GAP} from "../../constants/mybusiness.constants";

const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: CONTAINER_PADDING,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    errorContainer: {
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    simpleRow: {
        flexDirection: 'row',
        alignItems: 'center',

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
    },

    twoItemPerRowParagraph: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    twoItemPerRowParagraphItemStyle: {
        flexBasis: '50%',
    },
    elementsGap: {
        marginTop: UI_ELEMENTS_GAP
    }
});

export default commonStyles