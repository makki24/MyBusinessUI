import { StyleSheet } from "react-native";
import { BORDER_RADIUS, CONTAINER_PADDING, UI_ELEMENTS_GAP } from "./constants";

const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: CONTAINER_PADDING,
    paddingTop: 0, // TODO: Need to check right container padding, current : 16
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  errorContainer: {
    padding: UI_ELEMENTS_GAP,
    marginBottom: UI_ELEMENTS_GAP,
    borderRadius: BORDER_RADIUS / 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  simpleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalContainer: {
    padding: CONTAINER_PADDING,
    borderRadius: BORDER_RADIUS,
    alignSelf: "center", // Center the modal on the screen
    width: "80%", // Set the width to a percentage of the screen width
  },
  modalButtonGap: {
    height: UI_ELEMENTS_GAP,
  },

  twoItemPerRowParagraph: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
  },
  twoItemPerRowParagraphItemStyle: {
    flexBasis: "50%",
  },
  elementsGap: {
    marginTop: UI_ELEMENTS_GAP,
  },
});

export default commonStyles;
