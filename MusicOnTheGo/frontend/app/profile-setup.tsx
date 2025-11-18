import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import RNPickerSelect from "react-native-picker-select";

const instruments = [
  { label: "Piano", value: "piano" },
  { label: "Guitar", value: "guitar" },
  { label: "Violin", value: "violin" },
  { label: "Voice / Singing", value: "voice" },
  { label: "Drums", value: "drums" },
  { label: "Bass", value: "bass" },
  { label: "Saxophone", value: "saxophone" },
];

export default function ProfileSetup() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [instrument, setInstrument] = useState("");
  const [location, setLocation] = useState("");

  return (
    <View style={styles.container}>
      {/* Gradient header */}
      <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
        <Text style={styles.headerTitle}>Complete Your Profile</Text>
        <Text style={styles.headerSubtitle}>
          Just a few more details before you begin!
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile photo */}
        <View style={styles.photoWrapper}>
          <TouchableOpacity style={styles.photoCircle}>
            <Ionicons name="camera" size={40} color="#FF6A5C" />
          </TouchableOpacity>
          <Text style={styles.photoText}>Add Profile Photo</Text>
        </View>

        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Instrument */}
        <Text style={styles.label}>Primary Instrument</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(v) => setInstrument(v)}
            items={instruments}
            placeholder={{ label: "Select instrument", value: null }}
            useNativeAndroidPickerStyle={false}
            style={{
              inputIOS: styles.picker,
              inputAndroid: styles.pickerAndroid,
            }}
          />
        </View>

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="City, State"
          value={location}
          onChangeText={setLocation}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => router.push("/dashboard")}
        >
          <Text style={styles.saveText}>Save & Continue</Text>
        </TouchableOpacity>

        {/* Teacher-specific option (will build later) */}
        <TouchableOpacity>
          <Text style={styles.link}>
            Set Weekly Availability (Teachers Only)
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

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },

  headerSubtitle: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    opacity: 0.9,
    marginTop: 5,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  photoWrapper: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },

  photoCircle: {
    width: 120,
    height: 120,
    backgroundColor: "#F7F7F7",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FF6A5C",
  },

  photoText: {
    marginTop: 10,
    color: "#555",
    fontSize: 14,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#F7F7F7",
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 15,
  },

  pickerWrapper: {
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 15,
  },

  picker: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
  },

  pickerAndroid: {
    color: "#333",
    paddingHorizontal: 10,
    paddingVertical: 14,
    fontSize: 15,
  },

  saveButton: {
    backgroundColor: "#FF6A5C",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },

  link: {
    textAlign: "center",
    color: "#FF6A5C",
    fontSize: 14,
    marginTop: 20,
  },
});
