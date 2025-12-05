import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "../../lib/api";

export default function ResetPassword() {
  const router = useRouter();
  const { token, email } = useLocalSearchParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Validate token and email are present
    if (!token || !email) {
      Alert.alert(
        "Invalid Link",
        "This password reset link is invalid or has expired. Please request a new one.",
        [
          {
            text: "Request New Link",
            onPress: () => router.push("/(auth)/forgot-password"),
          },
        ]
      );
    }
  }, [token, email]);

  const handleSubmit = async () => {
    // Validation
    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token || !email) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token: token as string,
          email: email as string,
          newPassword: newPassword.trim(),
        }),
      });

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Card style={styles.card}>
              <View style={styles.successContent}>
                <View style={styles.successIconContainer}>
                  <View style={styles.successIconBackground}>
                    <Ionicons name="checkmark-circle" size={48} color="#059669" />
                  </View>
                </View>

                <View style={styles.successTextContainer}>
                  <Text style={styles.successTitle}>Password Reset Successful!</Text>
                  <Text style={styles.successMessage}>
                    Your password has been reset. Redirecting to login...
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButtonTop}
          >
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <Card style={styles.card}>
            <View style={styles.formContent}>
              <View style={styles.headerSection}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Enter your new password below
                </Text>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.formSection}>
                <Label>New Password</Label>
                <Input
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError("");
                  }}
                  secureTextEntry
                  style={styles.input}
                />
                <Text style={styles.helperText}>
                  Must be at least 6 characters
                </Text>
              </View>

              <View style={styles.formSection}>
                <Label>Confirm Password</Label>
                <Input
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError("");
                  }}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <Button
                onPress={handleSubmit}
                disabled={loading || !token || !email}
                style={styles.submitButton}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>

              <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                style={styles.loginLink}
              >
                <Text style={styles.loginLinkText}>
                  Remember your password? <Text style={styles.loginLinkBold}>Log in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F3",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  content: {
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  backButtonTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#666",
  },
  card: {
    padding: 24,
  },
  formContent: {
    gap: 24,
  },
  headerSection: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF6A5C",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: "#FFE0D6",
    borderColor: "#FF6A5C",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: "#FF6A5C",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  formSection: {
    gap: 8,
  },
  input: {
    backgroundColor: "#FFF5F3",
    borderColor: "#FFE0D6",
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: -4,
  },
  submitButton: {
    marginTop: 8,
  },
  loginLink: {
    alignItems: "center",
    marginTop: 8,
  },
  loginLinkText: {
    fontSize: 14,
    color: "#666",
  },
  loginLinkBold: {
    color: "#FF6A5C",
    fontWeight: "600",
  },
  // Success state styles
  successContent: {
    alignItems: "center",
    gap: 24,
  },
  successIconContainer: {
    marginBottom: 8,
  },
  successIconBackground: {
    backgroundColor: "#D6FFE1",
    borderRadius: 50,
    padding: 16,
  },
  successTextContainer: {
    alignItems: "center",
    gap: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

