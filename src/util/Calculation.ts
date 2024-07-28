export function scaleValue(value, originalMin, originalMax) {
  const newMin = 0;
  const newMax = 20;

  return (
    ((value - originalMin) / (originalMax - originalMin)) * (newMax - newMin) +
    newMin
  );
}
