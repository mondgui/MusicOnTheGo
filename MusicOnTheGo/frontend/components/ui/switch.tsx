import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";

type SwitchProps = {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Switch({
  value = false,
  onValueChange,
  disabled = false,
  style,
}: SwitchProps) {
  return (
    <TouchableOpacity
      style={[
        styles.switch,
        value && styles.switchOn,
        disabled && styles.switchDisabled,
        style,
      ]}
      onPress={() => !disabled && onValueChange?.(!value)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.thumb,
          value && styles.thumbOn,
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E5E5E5",
    padding: 2,
    justifyContent: "center",
  },
  switchOn: {
    backgroundColor: "#FF6A5C",
  },
  switchDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbOn: {
    transform: [{ translateX: 20 }],
  },
});

