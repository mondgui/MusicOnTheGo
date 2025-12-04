import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

type ProgressProps = {
  value: number; // 0-100
  style?: ViewStyle;
  className?: string; // For compatibility with web code
};

export function Progress({ value, style, className }: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <View style={[styles.progressContainer, style]}>
      <View
        style={[
          styles.progressBar,
          { width: `${clampedValue}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF6A5C",
    borderRadius: 4,
  },
});

