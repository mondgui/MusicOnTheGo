import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Trim passwords to remove any accidental whitespace
    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Validation
    if (!trimmedCurrentPassword || !trimmedNewPassword || !trimmedConfirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (trimmedNewPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long.");
      return;
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    if (trimmedCurrentPassword === trimmedNewPassword) {
      Alert.alert("Error", "New password must be different from your current password.");
      return;
    }

    setLoading(true);
    try {
      await api("/api/users/me/change-password", {
        method: "PUT",
        auth: true,
        body: JSON.stringify({
          currentPassword: trimmedCurrentPassword,
          newPassword: trimmedNewPassword,
        }),
      });

      Alert.alert("Success", "Password changed successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>Update your account password</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Must be at least 6 characters</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Changing Password..." : "Change Password"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  backText: {
    color: "white",
    fontSize: 16,
    opacity: 0.9,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    color: "white",
    opacity: 0.9,
    textAlign: "center",
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 50,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#FF6A5C",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});

