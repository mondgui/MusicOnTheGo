import React from "react";
import { View, Image, Text, StyleSheet, ViewStyle } from "react-native";

type AvatarProps = {
  src?: string;
  fallback?: string;
  style?: ViewStyle;
  size?: number;
  children?: React.ReactNode;
};

export function Avatar({ src, fallback, style, size = 40, children }: AvatarProps) {
  // If children are provided, use compound pattern
  if (children) {
    return (
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>
        {children}
      </View>
    );
  }

  // Otherwise use simple pattern with src/fallback props
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {src ? (
        <Image source={{ uri: src }} style={styles.image} />
      ) : (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>
            {fallback || "?"}
          </Text>
        </View>
      )}
    </View>
  );
}

export function AvatarImage({ src, style }: { src?: string; style?: ViewStyle }) {
  if (!src) return null;
  return <Image source={{ uri: src }} style={[styles.image, { width: "100%", height: "100%" }, style]} />;
}

export function AvatarFallback({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.fallback, { width: "100%", height: "100%" }, style]}>
      <Text style={styles.fallbackText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    backgroundColor: "#FFE0D6",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: "#FF6A5C",
    fontWeight: "600",
  },
});

