import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

type SeparatorProps = {
  style?: ViewStyle;
  orientation?: "horizontal" | "vertical";
};

export function Separator({ style, orientation = "horizontal" }: SeparatorProps) {
  return (
    <View
      style={[
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: "#E5E5E5",
    width: "100%",
  },
  vertical: {
    width: 1,
    backgroundColor: "#E5E5E5",
    height: "100%",
  },
});

