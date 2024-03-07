// commonStyles.ts

import { StyleSheet } from "react-native";

import { CONTAINER_PADDING } from "./constants";

const commonScreenStyles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: CONTAINER_PADDING,
    right: 0,
    bottom: 0,
  },
});

export default commonScreenStyles;
