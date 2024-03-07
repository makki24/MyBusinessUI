import { StyleSheet } from "react-native";
import { BORDER_RADIUS, CONTAINER_PADDING, UI_ELEMENTS_GAP } from "./constants";

const cardHeight = 175;
const cardTitle = CONTAINER_PADDING;

const homeScreenStyles = StyleSheet.create({
  container: {
    padding: CONTAINER_PADDING,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: CONTAINER_PADDING, // may be not needed
  },
  card: {
    width: "48%",
    height: cardHeight,
    marginBottom: CONTAINER_PADDING,
    borderRadius: BORDER_RADIUS,
    overflow: "hidden",
    position: "relative",
  },
  textOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: UI_ELEMENTS_GAP,
  },
  cardTitle: {
    fontSize: cardTitle,
    fontWeight: "bold",
    color: "#fff",
  },
  gap: {
    width: "4%",
  },
  amountText: {
    marginVertical: UI_ELEMENTS_GAP,
  },
});

export default homeScreenStyles;
