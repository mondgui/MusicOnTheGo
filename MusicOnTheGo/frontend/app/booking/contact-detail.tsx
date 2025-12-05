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
import { api } from "../../lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InquiryForm() {
  const router = useRouter();
  const { teacherId } = useLocalSearchParams();

  const [teacher, setTeacher] = useState<any>(null);
  const [instrument, setInstrument] = useState("");
  const [level, setLevel] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [lessonType, setLessonType] = useState("");
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");
  const [goals, setGoals] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const data = await api(`/api/teachers/${teacherId}`, {
          method: "GET",
          auth: true,
        });
        setTeacher(data);
      } catch (err: any) {
        console.error("Error loading teacher:", err);
      }
    };

    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId]);

  const submitInquiry = async () => {
    // Validation
    if (!instrument.trim()) {
      setError("Please enter an instrument");
      return;
    }
    if (!level) {
      setError("Please select a level");
      return;
    }
    if (!lessonType) {
      setError("Please select a lesson type");
      return;
    }
    if (!availability.trim()) {
      setError("Please enter your availability");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api("/api/inquiries", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          teacher: teacherId,
          instrument: instrument.trim(),
          level,
          ageGroup: ageGroup || undefined,
          lessonType,
          availability: availability.trim(),
          message: message.trim() || undefined,
          goals: goals.trim() || undefined,
          guardianName: guardianName.trim() || undefined,
          guardianPhone: guardianPhone.trim() || undefined,
          guardianEmail: guardianEmail.trim() || undefined,
        }),
      });

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/booking/booking-success");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Request Info</Text>
            <Text style={styles.headerSubtitle}>
              Send a question to the teacher
            </Text>
          </View>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formContainer}>
          <Card style={styles.formCard}>
            {/* Success Message */}
            {showSuccess && (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#059669" />
                <Text style={styles.successText}>Inquiry sent successfully!</Text>
              </View>
            )}

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Instrument */}
            <View style={styles.fieldGroup}>
              <Label style={styles.label}>
                Instrument <Text style={styles.required}>*</Text>
              </Label>
              <Input
                placeholder="e.g. Piano, Guitar"
                value={instrument}
                onChangeText={setInstrument}
                style={styles.input}
              />
            </View>

            {/* Level */}
            <View style={styles.fieldGroup}>
              <Label style={styles.label}>
                Level <Text style={styles.required}>*</Text>
              </Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Beginner, Intermediate, Advanced" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </View>

            {/* Age Group */}
            <View style={styles.fieldGroup}>
              <Label style={styles.label}>Age Group (optional)</Label>
              <Select value={ageGroup} onValueChange={setAgeGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Child, Teen, Adult" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Child">Child (5-12)</SelectItem>
                  <SelectItem value="Teen">Teen (13-17)</SelectItem>
                  <SelectItem value="Adult">Adult (18+)</SelectItem>
                </SelectContent>
              </Select>
            </View>

            {/* Lesson Type */}
            <View style={styles.fieldGroup}>
              <Label style={styles.label}>
                Lesson Type <Text style={styles.required}>*</Text>
              </Label>
              <Select value={lessonType} onValueChange={setLessonType}>
                <SelectTrigger>
                  <SelectValue placeholder="In-person, Online, Either" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-person">In-person</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Either">Either</SelectItem>
                </SelectContent>
              </Select>
            </View>

            {/* Availability */}
            <View style={styles.fieldGroup}>
              <Label style={styles.label}>
                Availability <Text style={styles.required}>*</Text>
              </Label>
              <Textarea
                placeholder="When are you available?"
                value={availability}
                onChangeText={setAvailability}
                style={styles.textarea}
              />
            </View>

            {/* Message */}
            <View style={styles.fieldGroup}>
              <Label style={styles.label}>Message (optional)</Label>
              <Textarea
                placeholder="Add your question or info..."
                value={message}
                onChangeText={setMessage}
                style={styles.textarea}
              />
            </View>

            {/* Goals / Interests */}
            <View style={styles.fieldGroup}>
              <Label style={styles.label}>Goals / Interests (optional)</Label>
              <Textarea
                placeholder="What would you like to achieve?"
                value={goals}
                onChangeText={setGoals}
                style={styles.textarea}
              />
            </View>

            {/* Parent/Guardian Section */}
            <View style={styles.guardianSection}>
              <Text style={styles.sectionTitle}>Parent/Guardian Contact</Text>

              {/* Guardian Name */}
              <View style={styles.fieldGroup}>
                <Label style={styles.label}>Name (optional)</Label>
                <Input
                  placeholder="Parent or guardian name"
                  value={guardianName}
                  onChangeText={setGuardianName}
                  style={styles.input}
                />
              </View>

              {/* Guardian Phone */}
              <View style={styles.fieldGroup}>
                <Label style={styles.label}>Phone (optional)</Label>
                <Input
                  placeholder="Contact phone number"
                  value={guardianPhone}
                  onChangeText={setGuardianPhone}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>

              {/* Guardian Email */}
              <View style={styles.fieldGroup}>
                <Label style={styles.label}>Email (optional)</Label>
                <Input
                  placeholder="Contact email address"
                  value={guardianEmail}
                  onChangeText={setGuardianEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitInquiry}
              disabled={loading || showSuccess}
            >
              <LinearGradient
                colors={["#FF9076", "#FF6A5C"]}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>
                  {loading ? "Sending..." : "Send Inquiry"}
                </Text>
                <Ionicons name="send-outline" size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Your inquiry will be sent to {teacher?.name || "the teacher"}
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
    paddingBottom: 40,
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
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
  headerContent: {
    marginTop: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "white",
    opacity: 0.9,
    fontSize: 14,
  },
  formContainer: {
    padding: 20,
    marginTop: -20,
  },
  formCard: {
    padding: 20,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D6FFE1",
    borderColor: "#059669",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FFE0D6",
    borderColor: "#FF6A5C",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF6A5C",
    fontSize: 14,
    fontWeight: "600",
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#FF6A5C",
  },
  input: {
    backgroundColor: "#FFF5F3",
    borderColor: "#FFE0D6",
  },
  textarea: {
    backgroundColor: "#FFF5F3",
    borderColor: "#FFE0D6",
    minHeight: 80,
  },
  guardianSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 10,
  },
  submitGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  footerText: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
});
