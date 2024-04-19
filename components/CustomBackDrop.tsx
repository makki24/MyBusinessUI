import React, { useMemo } from "react";
import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useColorScheme } from "react-native";

const CustomBackdrop = ({ animatedIndex, style }: BottomSheetBackdropProps) => {
  const colorScheme = useColorScheme();
  // animated variables
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [1, 1],
      [1, 1],
      Extrapolate.CLAMP,
    ),
  }));

  // styles
  const containerStyle = useMemo(
    () => [
      style,
      {
        backgroundColor:
          colorScheme === "light" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)",
      },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle],
  );

  return <Animated.View style={containerStyle} />;
};

export default CustomBackdrop;
