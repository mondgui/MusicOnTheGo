import React, { useState, useEffect } from "react";
import { View, Image, Text, StyleSheet, ViewStyle } from "react-native";

type AvatarProps = {
  src?: string;
  fallback?: string;
  style?: ViewStyle;
  size?: number;
  children?: React.ReactNode;
};

export function Avatar({ src, fallback, style, size = 40, children }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  // If children are provided, use compound pattern
  if (children) {
    return (
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: "#FFE0D6" }, style]}>
        {children}
      </View>
    );
  }

  // Otherwise use simple pattern with src/fallback props
  // Handle empty strings as well as null/undefined
  const hasValidImage = src && typeof src === "string" && src.trim().length > 0 && !imageError;
  
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: "#FFE0D6" }, style]}>
      {hasValidImage ? (
        <Image 
          source={{ uri: src }} 
          style={[styles.image, { width: size, height: size }]}
          onError={() => {
            // Image failed to load - show fallback
            setImageError(true);
          }}
          onLoadStart={() => {
            // Reset error state when trying to load a new image
            setImageError(false);
          }}
        />
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
  // Handle empty strings as well as null/undefined
  if (!src || (typeof src === "string" && src.trim().length === 0)) return null;
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
    backgroundColor: "#FFE0D6", // Background color so it's always visible
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  fallback: {
    backgroundColor: "#FFE0D6",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  fallbackText: {
    color: "#FF6A5C",
    fontWeight: "600",
  },
});

