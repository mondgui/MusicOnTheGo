import React, { useState, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  ViewStyle,
  GestureResponderEvent,
} from "react-native";

type SliderProps = {
  value: number[];
  onValueChange: (values: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: ViewStyle;
  className?: string; // For compatibility with web code
};

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  style,
  className,
}: SliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const currentValue = value[0] || min;
  const percentage = ((currentValue - min) / (max - min)) * 100;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const width = trackWidthRef.current;
          if (width === 0) return;
          const { locationX } = evt.nativeEvent;
          const clampedX = Math.max(0, Math.min(width, locationX));
          const newPercentage = (clampedX / width) * 100;
          const newValue = min + (newPercentage / 100) * (max - min);
          const steppedValue = Math.round(newValue / step) * step;
          const clampedValue = Math.max(min, Math.min(max, steppedValue));
          onValueChange([clampedValue]);
        },
        onPanResponderMove: (evt) => {
          const width = trackWidthRef.current;
          if (width === 0) return;
          const { locationX } = evt.nativeEvent;
          const clampedX = Math.max(0, Math.min(width, locationX));
          const newPercentage = (clampedX / width) * 100;
          const newValue = min + (newPercentage / 100) * (max - min);
          const steppedValue = Math.round(newValue / step) * step;
          const clampedValue = Math.max(min, Math.min(max, steppedValue));
          onValueChange([clampedValue]);
        },
      }),
    [min, max, step, onValueChange]
  );

  const handleLayout = (e: any) => {
    const width = e.nativeEvent.layout.width;
    setTrackWidth(width);
    trackWidthRef.current = width;
  };

  return (
    <View
      style={[styles.container, style]}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${percentage}%` }]} />
        <View
          style={[
            styles.thumb,
            { left: `${percentage}%`, marginLeft: -10 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
    paddingVertical: 10,
  },
  track: {
    height: 4,
    backgroundColor: "#E5E5E5",
    borderRadius: 2,
    position: "relative",
  },
  trackFill: {
    height: "100%",
    backgroundColor: "#FF6A5C",
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF6A5C",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    top: -8,
  },
});

