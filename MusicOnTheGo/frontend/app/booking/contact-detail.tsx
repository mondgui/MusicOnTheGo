import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../../lib/api";

export default function InquiryForm() {
  const router = useRouter();

  // Teacher ID is passed from: router.push({ pathname: "/booking/contact-detail", params: { teacherId } })
  const { teacherId } = useLocalSearchParams();

  const [instrument, setInstrument] = useState("");
  const [level, setLevel] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [lessonType, setLessonType] = useState("");
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitInquiry = async () => {
    try {
      setLoading(true);
      setError("");

      await api("/api/inquiries", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          teacherId,
          instrument,
          level,
          ageGroup,
          lessonType,
          availability,
          message,
        }),
      });

      router.push("/booking/booking-success");

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* HEADER */}
        <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
          <Text style={styles.headerTitle}>Request Info</Text>
          <Text style={styles.headerSubtitle}>Send a question to the teacher</Text>
        </LinearGradient>

        <View style={styles.formContainer}>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Instrument *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Piano, Guitar"
            value={instrument}
            onChangeText={setInstrument}
          />

          <Text style={styles.label}>Level *</Text>
          <TextInput
            style={styles.input}
            placeholder="Beginner, Intermediate, Advanced"
            value={level}
            onChangeText={setLevel}
          />

          <Text style={styles.label}>Age Group (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Child, Teen, Adult"
            value={ageGroup}
            onChangeText={setAgeGroup}
          />

          <Text style={styles.label}>Lesson Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="In-person, Online, Either"
            value={lessonType}
            onChangeText={setLessonType}
          />

          <Text style={styles.label}>Availability *</Text>
          <TextInput
            style={[styles.input, { height: 70 }]}
            multiline
            placeholder="When are you available?"
            value={availability}
            onChangeText={setAvailability}
          />

          <Text style={styles.label}>Message (optional)</Text>
          <TextInput
            style={[styles.input, { height: 120 }]}
            multiline
            placeholder="Add your question or info..."
            value={message}
            onChangeText={setMessage}
          />

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={submitInquiry}
            disabled={loading}
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

        </View>
      </ScrollView>
    </View>
  );
}

// ---------- STYLES ---------- //

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F3",
  },

  header: {
    paddingTop: 70,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTitle: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "white",
    opacity: 0.8,
    marginTop: 5,
  },

  formContainer: {
    padding: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 14,
  },

  errorText: {
    color: "red",
    marginBottom: 15,
    fontWeight: "600",
  },

  submitButton: {
    marginTop: 10,
  },

  submitGradient: {
    backgroundColor: "#FF6A5C",
    paddingVertical: 14,
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
});
