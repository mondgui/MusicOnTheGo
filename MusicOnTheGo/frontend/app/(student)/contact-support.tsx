import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";

export default function ContactSupportScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    queryType: "",
    subject: "",
    message: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.queryType || !formData.subject || !formData.message) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Show success message
    setShowSuccess(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        name: "",
        email: "",
        queryType: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={["#FF9076", "#FF6A5C"]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="mail" size={32} color="white" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Contact Support</Text>
              <Text style={styles.headerSubtitle}>We're here to help</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Success Message */}
          {showSuccess && (
            <Card style={styles.successCard}>
              <Text style={styles.successText}>
                ✓ Your message has been sent! We'll get back to you within
                24-48 hours.
              </Text>
            </Card>
          )}

          <Card style={styles.formCard}>
            {/* Name */}
            <View style={styles.formField}>
              <Label>
                Your Name <Text style={styles.required}>*</Text>
              </Label>
              <Input
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                style={styles.input}
              />
            </View>

            {/* Email */}
            <View style={styles.formField}>
              <Label>
                Email Address <Text style={styles.required}>*</Text>
              </Label>
              <Input
                placeholder="your.email@example.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Query Type */}
            <View style={styles.formField}>
              <Label>
                Type of Query <Text style={styles.required}>*</Text>
              </Label>
              <Select
                value={formData.queryType}
                onValueChange={(value) => handleInputChange("queryType", value)}
                placeholder="Select query type"
              >
                <SelectTrigger style={styles.selectTrigger}>
                  <SelectValue placeholder="Select query type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="suggestion">Suggestion for the App</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="account">Account Issue</SelectItem>
                  <SelectItem value="payment">Payment Question</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="safety">Safety Concern</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </View>

            {/* Subject */}
            <View style={styles.formField}>
              <Label>
                Subject <Text style={styles.required}>*</Text>
              </Label>
              <Input
                placeholder="Brief summary of your query"
                value={formData.subject}
                onChangeText={(value) => handleInputChange("subject", value)}
                style={styles.input}
              />
            </View>

            {/* Message */}
            <View style={styles.formField}>
              <Label>
                Message <Text style={styles.required}>*</Text>
              </Label>
              <TextInput
                placeholder="Please describe your query in detail..."
                value={formData.message}
                onChangeText={(value) => handleInputChange("message", value)}
                multiline
                numberOfLines={6}
                style={styles.textarea}
                textAlignVertical="top"
              />
              <Text style={styles.helperText}>
                Please provide as much detail as possible to help us assist you
                better.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF9076", "#FF6A5C"]}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>Send Message</Text>
                <Ionicons name="send" size={20} color="white" style={styles.sendIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </Card>

          {/* Alternative Contact Methods */}
          <Card style={styles.contactCard}>
            <Text style={styles.contactCardTitle}>
              Other ways to reach us
            </Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactItem}>
                <Text style={styles.contactLabel}>Email:</Text>{" "}
                support@musiconthego.com
              </Text>
              <Text style={styles.contactItem}>
                <Text style={styles.contactLabel}>Phone:</Text> +1 (800)
                555-MUSIC
              </Text>
              <Text style={styles.contactHours}>
                Available Mon-Fri, 9am-6pm EST
              </Text>
            </View>
          </Card>

          {/* Response Time */}
          <Card style={styles.responseTimeCard}>
            <Text style={styles.responseTimeText}>
              <Text style={styles.responseTimeBold}>Response Time:</Text> We
              typically respond within 24-48 hours. For urgent safety concerns,
              please call us directly.
            </Text>
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
    paddingBottom: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  successCard: {
    padding: 16,
    backgroundColor: "#D6FFE1",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  successText: {
    fontSize: 14,
    color: "#059669",
    textAlign: "center",
    lineHeight: 20,
  },
  formCard: {
    padding: 24,
  },
  formField: {
    marginBottom: 20,
  },
  required: {
    color: "#FF6A5C",
  },
  input: {
    backgroundColor: "#FFE0D6",
    borderColor: "#FFC4B0",
  },
  selectTrigger: {
    backgroundColor: "#FFE0D6",
    borderColor: "#FFC4B0",
  },
  textarea: {
    backgroundColor: "#FFE0D6",
    borderWidth: 1,
    borderColor: "#FFC4B0",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  sendIcon: {
    marginLeft: 8,
  },
  contactCard: {
    padding: 24,
  },
  contactCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    lineHeight: 20,
  },
  contactLabel: {
    fontWeight: "700",
  },
  contactHours: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  responseTimeCard: {
    padding: 16,
    backgroundColor: "#FFF3C4",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  responseTimeText: {
    fontSize: 14,
    color: "#D97706",
    textAlign: "center",
    lineHeight: 20,
  },
  responseTimeBold: {
    fontWeight: "700",
  },
});
