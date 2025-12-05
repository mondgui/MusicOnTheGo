import React from "react";
import { TextInput, StyleSheet, TextInputProps, ViewStyle } from "react-native";

type TextareaProps = TextInputProps & {
  style?: ViewStyle;
};

export function Textarea({ style, ...props }: TextareaProps) {
  return (
    <TextInput
      style={[styles.textarea, style]}
      multiline
      textAlignVertical="top"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    minHeight: 80,
  },
});

