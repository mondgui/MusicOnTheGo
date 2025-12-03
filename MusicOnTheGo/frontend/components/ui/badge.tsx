import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "warning";
  style?: ViewStyle;
};

export function Badge({
  children,
  variant = "default",
  style,
}: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  default: {
    backgroundColor: "#FFE0D6",
  },
  defaultText: {
    color: "#FF6A5C",
    fontSize: 12,
    fontWeight: "600",
  },
  secondary: {
    backgroundColor: "#F4F4F4",
  },
  secondaryText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  success: {
    backgroundColor: "#D6FFE1",
  },
  successText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "600",
  },
  warning: {
    backgroundColor: "#FFF3C4",
  },
  warningText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "600",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});

