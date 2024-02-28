import { StyleSheet } from 'react-native';
import {CONTAINER_PADDING, UI_ELEMENTS_GAP} from "./constants";

const commonItemStyles = StyleSheet.create({
    card: {
        marginBottom: CONTAINER_PADDING,
    },
    cardContent: {
        paddingHorizontal: CONTAINER_PADDING,
        paddingBottom: UI_ELEMENTS_GAP,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: UI_ELEMENTS_GAP,
    },
    cardActions: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    tagsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: UI_ELEMENTS_GAP,
    },
    tagsLabel: {
        fontWeight: 'bold',
        marginRight: UI_ELEMENTS_GAP,
    },
    tagChipsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagChip: {
        marginHorizontal: UI_ELEMENTS_GAP/2,
    },
});

export default commonItemStyles;
