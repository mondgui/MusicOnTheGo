import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.container}>
      {/* Big checkmark */}
      <View style={styles.iconWrapper}>
        <Ionicons name="checkmark-circle" size={120} color="white" />
      </View>

      {/* Title */}
      <Text style={styles.title}>Account Created!</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Your music journey begins now.{"\n"}Log in to access your account.
      </Text>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/profile-setup")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  iconWrapper: {
    alignSelf: "center",
    marginBottom: 30,
  },

  title: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    marginBottom: 15,
  },

  subtitle: {
    textAlign: "center",
    fontSize: 16,
    color: "white",
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 40,
  },

  button: {
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 30,
    marginHorizontal: 20,
    alignItems: "center",
    ...Platform.select({
      web: { boxShadow: "0px 3px 5px rgba(0,0,0,0.2)" } as any,
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
      },
    }),
  },

  buttonText: {
    color: "#FF6A5C",
    fontSize: 18,
    fontWeight: "700",
  },
});
