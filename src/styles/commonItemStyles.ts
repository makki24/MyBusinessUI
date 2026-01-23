import { StyleSheet } from "react-native";
import {
  BORDER_RADIUS,
  CONTAINER_PADDING,
  UI_ELEMENTS_GAP,
  SHADOW,
} from "./constants";
import { SURFACE } from "./colors";

const commonItemStyles = StyleSheet.create({
  card: {
    padding: CONTAINER_PADDING,
    borderRadius: BORDER_RADIUS,
    marginBottom: UI_ELEMENTS_GAP,
    backgroundColor: SURFACE,
    ...SHADOW,
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
    flexWrap: "wrap",
    paddingRight: UI_ELEMENTS_GAP,
    width: "80%",
  },
  tagChip: {
    marginHorizontal: UI_ELEMENTS_GAP / 2,
    marginTop: UI_ELEMENTS_GAP / 2,
  },
});

export default commonItemStyles;
