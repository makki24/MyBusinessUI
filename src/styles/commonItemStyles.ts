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
  // ── Shared card-body styles (WorkItem / SaleItem / UserItem) ───────────────
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  userRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 4,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  amount: {
    fontWeight: "700",
    fontSize: 18,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  tagsRow: {
    marginTop: 8,
  },
});

export default commonItemStyles;
