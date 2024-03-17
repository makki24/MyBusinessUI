import { StyleSheet } from "react-native";
import { UI_ELEMENTS_GAP } from "./constants";

const commonItemStyles = StyleSheet.create({
  card: {
    marginBottom: UI_ELEMENTS_GAP,
  },
  cardContent: {
    paddingBottom: UI_ELEMENTS_GAP,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardActionsWithTags: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  cardActions: {
    paddingTop: 0,
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: UI_ELEMENTS_GAP,
  },
  tagsLabel: {
    fontWeight: "bold",
    marginRight: UI_ELEMENTS_GAP,
  },
  tagChipsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagChip: {
    marginHorizontal: UI_ELEMENTS_GAP / 2,
  },
});

export default commonItemStyles;
