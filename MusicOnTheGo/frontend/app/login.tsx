import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../lib/api";
import { saveAuth } from "../lib/auth";


export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {
    try {
      const result = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // ✅ Save JWT token
      await saveAuth(result.token, result.user);



      alert("Logged in successfully!");

      // Redirect based on role
      if (result.user.role === "student") {
        router.replace("/(student)/dashboard");
      } else {
        router.replace("/(teacher)/dashboard");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Ionicons
          name="log-in-outline"
          size={40}
          color="white"
          style={{ alignSelf: "center", marginBottom: 10 }}
        />

        <Text style={styles.headerTitle}>Log In</Text>
        <Text style={styles.headerSubtitle}>
          Access your MusicOnTheGo account
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity onPress={() => router.push("/forgot-password")}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={loginUser}>
          <Text style={styles.submitText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/choose-role")}>
          <Text style={styles.footerText}>
            Don’t have an account? <Text style={styles.footerLink}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: { width: 40, marginBottom: 10 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
    textAlign: "center",
    marginTop: 5,
  },
  formContainer: { paddingHorizontal: 20, paddingVertical: 20 },
  inputLabel: { fontSize: 14, fontWeight: "600", marginTop: 15, marginBottom: 6 },
  input: {
    backgroundColor: "#F7F7F7",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  forgotText: {
    marginTop: 10,
    textAlign: "right",
    color: "#FF6A5C",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#FF6A5C",
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  submitText: { color: "white", fontSize: 17, fontWeight: "700" },
  footerText: { textAlign: "center", fontSize: 14, marginTop: 15 },
  footerLink: { color: "#FF6A5C", fontWeight: "600" },
});
