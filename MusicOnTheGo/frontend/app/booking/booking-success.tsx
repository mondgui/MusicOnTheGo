import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function InquirySuccess() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
        <Ionicons name="checkmark-circle-outline" size={80} color="white" />
        <Text style={styles.title}>Message Sent!</Text>
        <Text style={styles.subtitle}>
          Your inquiry has been delivered to the teacher.
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.description}>
          You will receive a response when the teacher reviews your request.
        </Text>

        {/* Back to dashboard button */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={() => router.push("/(student)/dashboard")}
        >
          <LinearGradient
            colors={["#FF9076", "#FF6A5C"]}
            style={styles.button}
          >
            <Ionicons name="home-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Back to Dashboard</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F3",
  },

  header: {
    paddingTop: 90,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginTop: 20,
  },

  subtitle: {
    color: "white",
    opacity: 0.9,
    marginTop: 8,
    fontSize: 15,
    textAlign: "center",
  },

  content: {
    padding: 25,
    alignItems: "center",
  },

  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },

  buttonWrapper: {
    width: "100%",
  },

  button: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
});
