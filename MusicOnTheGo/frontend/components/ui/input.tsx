import React from "react";
import { TextInput, StyleSheet, TextInputProps, ViewStyle } from "react-native";

type InputProps = TextInputProps & {
  style?: ViewStyle;
};

export function Input({ style, ...props }: InputProps) {
  return <TextInput style={[styles.input, style]} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
});

