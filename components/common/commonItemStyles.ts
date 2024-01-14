import { StyleSheet } from 'react-native';

const commonItemStyles = StyleSheet.create({
    card: {
        marginBottom: 16,
    },
    cardContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardActions: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    tagsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    tagsLabel: {
        fontWeight: 'bold',
        marginRight: 8,
    },
    tagChipsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagChip: {
        marginHorizontal: 4,
    },
});

export default commonItemStyles;
