// frontend/app/student-profile-setup.tsx
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../../lib/api";

const SKILL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const MODE_OPTIONS = ["In-person", "Online", "Hybrid"];
const AGE_OPTIONS = ["5-9 (via parent)", "10-15", "16-20", "21-30", "31-45", "46-60", "61+"];

export default function StudentProfileSetup() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const fullName = (params.fullName as string) || "";
  const instruments =
    (params.instruments && JSON.parse(params.instruments as string)) || [];
  const location = (params.location as string) || "";

  const [skillLevel, setSkillLevel] = useState("");
  const [learningMode, setLearningMode] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [availability, setAvailability] = useState("");
  const [goals, setGoals] = useState("");

  const saveProfile = async () => {
    try {
      await api("/api/users/me", {
        method: "PUT",
        auth: true,
        body: JSON.stringify({
          skillLevel,
          learningMode,
          ageGroup,
          availability,
          goals,
        }),
      });

      router.replace("/(auth)/login");
    } catch (e: any) {
      alert(e.message || "Failed to save profile");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
        <Text style={styles.title}>Finish Your Profile</Text>
        <Text style={styles.subtitle}>Tell teachers about your learning goals</Text>
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
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.inputDisabled} value={fullName} editable={false} />

          <Text style={styles.label}>Instrument(s) You Want to Learn</Text>
          <TextInput
            style={styles.inputDisabled}
            value={instruments.join(", ")}
            editable={false}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.inputDisabled} value={location} editable={false} />

          <Text style={styles.label}>Skill Level</Text>
          <View style={styles.chipRow}>
            {SKILL_OPTIONS.map((option) => {
              const selected = skillLevel === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.chipWrapper}
                  onPress={() => setSkillLevel(option)}
                >
                  <LinearGradient
                    colors={selected ? ["#FF9076", "#FF6A5C"] : ["#FFE4DB", "#FFE4DB"]}
                    style={styles.chip}
                  >
                    <Text style={selected ? styles.chipTextSelected : styles.chipText}>
                      {option}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Preferred Learning Mode</Text>
          <View style={styles.chipRow}>
            {MODE_OPTIONS.map((option) => {
              const selected = learningMode === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.chipWrapper}
                  onPress={() => setLearningMode(option)}
                >
                  <LinearGradient
                    colors={selected ? ["#FF9076", "#FF6A5C"] : ["#FFE4DB", "#FFE4DB"]}
                    style={styles.chip}
                  >
                    <Text style={selected ? styles.chipTextSelected : styles.chipText}>
                      {option}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Age or Age Group</Text>
          <View style={styles.chipRow}>
            {AGE_OPTIONS.map((option) => {
              const selected = ageGroup === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.chipWrapper}
                  onPress={() => setAgeGroup(option)}
                >
                  <LinearGradient
                    colors={selected ? ["#FF9076", "#FF6A5C"] : ["#FFE4DB", "#FFE4DB"]}
                    style={styles.chip}
                  >
                    <Text style={selected ? styles.chipTextSelected : styles.chipText}>
                      {option}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Availability</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Evenings, Weekends"
            value={availability}
            onChangeText={setAvailability}
          />

          <Text style={styles.label}>About me and Learning Goals</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            placeholder="Share what you want to achieve, preferred genres, etc."
            value={goals}
            onChangeText={setGoals}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
            <Text style={styles.saveText}>Finish and create profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "white", textAlign: "center" },
  subtitle: { color: "white", opacity: 0.9, textAlign: "center", marginTop: 5 },
  content: { paddingHorizontal: 20, paddingBottom: 50 },
  label: { marginTop: 15, fontWeight: "600", fontSize: 14 },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  inputDisabled: {
    backgroundColor: "#EDEDED",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    color: "#999",
  },
  textArea: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    height: 120,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  chipWrapper: {
    marginRight: 8,
    marginBottom: 8,
  },
  chip: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    color: "#FF6A5C",
    fontWeight: "600",
  },
  chipTextSelected: {
    fontSize: 13,
    color: "white",
    fontWeight: "700",
  },
  saveBtn: {
    backgroundColor: "#FF6A5C",
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 30,
    alignItems: "center",
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "700" },
});
