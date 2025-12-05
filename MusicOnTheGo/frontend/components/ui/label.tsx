import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";

type LabelProps = {
  children: React.ReactNode;
  style?: TextStyle;
};

export function Label({ children, style }: LabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
});

