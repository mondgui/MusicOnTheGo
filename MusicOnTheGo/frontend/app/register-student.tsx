// frontend/app/register-student.tsx

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
import DropDownPicker from "react-native-dropdown-picker";
import { api } from "../lib/api";

// Instrument list
const instruments = [
  { label: "Piano", value: "piano" },
  { label: "Guitar", value: "guitar" },
  { label: "Violin", value: "violin" },
  { label: "Voice / Singing", value: "voice" },
  { label: "Drums", value: "drums" },
  { label: "Bass", value: "bass" },
  { label: "Saxophone", value: "saxophone" },
  { label: "Flute", value: "flute" },
  { label: "Trumpet", value: "trumpet" },
  { label: "Clarinet", value: "clarinet" },
  { label: "Cello", value: "cello" },
  { label: "Trombone", value: "trombone" },
  { label: "Harp", value: "harp" },
  { label: "Ukulele", value: "ukulele" },
  { label: "Banjo", value: "banjo" },
  { label: "Accordion", value: "accordion" },
  { label: "Oboe", value: "oboe" },
  { label: "Mandolin", value: "mandolin" },
  { label: "Synthesizer / Keyboard", value: "synth" },
  { label: "Percussion (General)", value: "percussion" },
];

export default function RegisterStudent() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [items, setItems] = useState(instruments);

  // Register student
  const registerStudent = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: "student",
          instruments: selectedInstruments,
          location,
        }),
      });

      alert("Account created!");
      router.push("/success");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Ionicons
          name="school-outline"
          size={40}
          color="white"
          style={{ alignSelf: "center", marginBottom: 10 }}
        />

        <Text style={styles.headerTitle}>Student Registration</Text>
        <Text style={styles.headerSubtitle}>Create your account to begin learning</Text>
      </LinearGradient>

      {/* FORM */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={fullName}
          onChangeText={setFullName}
        />

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
          placeholder="Create a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.inputLabel}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* MULTI-SELECT DROPDOWN */}
        <Text style={styles.inputLabel}>Instrument(s)</Text>

        <DropDownPicker
          multiple
          min={1}
          max={5}
          open={open}
          value={selectedInstruments}
          items={items}
          setOpen={setOpen}
          setValue={setSelectedInstruments}
          setItems={setItems}
          placeholder="Select instrument(s)"
          listMode="SCROLLVIEW"
          nestedScrollEnabled={true}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          renderBadgeItem={(item: { label: string; value: string }) => (
            <View style={styles.badge} key={item.value}>
              <Text style={styles.badgeText}>{item.label}</Text>
            </View>
          )}
        />

        <Text style={styles.inputLabel}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="City, State"
          value={location}
          onChangeText={setLocation}
        />

        <TouchableOpacity style={styles.submitButton} onPress={registerStudent}>
          <Text style={styles.submitText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.footerLink}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ---------- STYLES ---------- */
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
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },

  headerSubtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
    textAlign: "center",
  },

  formContainer: { paddingHorizontal: 20, paddingVertical: 20 },

  inputLabel: { fontSize: 14, fontWeight: "600", marginTop: 15, marginBottom: 6 },

  input: {
    backgroundColor: "#F7F7F7",
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#E0E0E0",
  },

  dropdown: {
    backgroundColor: "#F7F7F7",
    borderColor: "#E0E0E0",
    marginBottom: 10,
    zIndex: 1000,
  },

  dropdownContainer: {
    borderColor: "#E0E0E0",
    zIndex: 1000,
  },

  badge: {
    backgroundColor: "#FF6A5C22",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },

  badgeText: {
    color: "#FF6A5C",
    fontWeight: "600",
    fontSize: 13,
  },

  submitButton: {
    backgroundColor: "#FF6A5C",
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 30,
    alignItems: "center",
  },

  submitText: { color: "white", fontSize: 17, fontWeight: "700" },

  footerText: { textAlign: "center", marginTop: 15, color: "#555" },

  footerLink: { color: "#FF6A5C", fontWeight: "600" },
});
