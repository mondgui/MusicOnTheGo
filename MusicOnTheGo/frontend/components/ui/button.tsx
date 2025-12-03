import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type ButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  disabled?: boolean;
};

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  style,
  disabled = false,
}: ButtonProps) {
  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 12, fontSize: 14 },
    md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 16 },
    lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 },
  };

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={style}
      >
        <LinearGradient
          colors={disabled ? ["#CCCCCC", "#AAAAAA"] : ["#FF9076", "#FF6A5C"]}
          style={[
            styles.button,
            { paddingVertical: sizeStyles[size].paddingVertical },
            style,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              { fontSize: sizeStyles[size].fontSize },
            ]}
          >
            {children}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        styles[variant],
        { paddingVertical: sizeStyles[size].paddingVertical },
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.buttonText,
          styles[`${variant}Text`],
          { fontSize: sizeStyles[size].fontSize },
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  secondary: {
    backgroundColor: "#F4F4F4",
  },
  secondaryText: {
    color: "#333",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF6A5C",
  },
  outlineText: {
    color: "#FF6A5C",
  },
});

