import { StyleSheet, Dimensions } from "react-native";
import { BORDER_RADIUS, CONTAINER_PADDING, SHADOW } from "./constants";
import { PRIMARY, SURFACE, TEXT_SECONDARY, BACKGROUND } from "./colors";

const { width } = Dimensions.get("window");
// Calculate card width: (Screen Width - (Padding * 3 for spacing)) / 2
// Assuming Container Padding (20) on Screen, + spacing between cards.
const cardWidth = (width - CONTAINER_PADDING * 3) / 2;

const homeScreenStyles = StyleSheet.create({
  container: {
    padding: CONTAINER_PADDING,
    paddingTop: CONTAINER_PADDING + 10,
    backgroundColor: BACKGROUND,
    minHeight: "100%",
  },
  headerGradient: {
    marginBottom: CONTAINER_PADDING * 1.5,
    padding: CONTAINER_PADDING,
    paddingTop: CONTAINER_PADDING * 2,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginTop: -CONTAINER_PADDING - 10, // Pull up to cover padding
    marginHorizontal: -CONTAINER_PADDING, // Stretch to edges
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: CONTAINER_PADDING, // Remove horizontal padding here to maximize space, rely on parent container
    marginTop: -30, // Pull up to overlap gradient
  },
  cardContainer: {
    width: cardWidth,
    marginBottom: CONTAINER_PADDING,
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS,
    ...SHADOW,
    elevation: 4,
  },
  cardContent: {
    alignItems: "center",
    padding: CONTAINER_PADDING,
    justifyContent: "center",
    minHeight: 140,
  },
  iconContainer: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 50,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: PRIMARY,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    textAlign: "center",
    marginTop: 4,
  },
  // Legacy card styles for AdminScreen
  card: {
    width: cardWidth,
    marginBottom: CONTAINER_PADDING,
    borderRadius: BORDER_RADIUS,
    overflow: "hidden",
    backgroundColor: SURFACE,
    ...SHADOW,
    elevation: 4,
  },
  cardCover: {
    height: 120,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
  },
  textOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
  },
  gap: {
    width: CONTAINER_PADDING,
  },
});

export default homeScreenStyles;
