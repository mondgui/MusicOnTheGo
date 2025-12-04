import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// Image picker - install with: npx expo install expo-image-picker
let ImagePicker: any = null;
try {
  ImagePicker = require("expo-image-picker");
} catch (e) {
  console.log("expo-image-picker not installed");
}
import { api } from "../../lib/api";

const SKILL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const MODE_OPTIONS = ["In-person", "Online", "Hybrid"];
const AGE_OPTIONS = ["5-9 (via parent)", "10-15", "16-20", "21-30", "31-45", "46-60", "61+"];
const INSTRUMENT_OPTIONS = [
  "Piano",
  "Guitar",
  "Violin",
  "Voice",
  "Drums",
  "Bass",
  "Saxophone",
  "Flute",
  "Trumpet",
  "Cello",
  "Other",
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [learningMode, setLearningMode] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [availability, setAvailability] = useState("");
  const [goals, setGoals] = useState("");

  // Load current user data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await api("/api/users/me", { auth: true });
      setName(user.name || "");
      setEmail(user.email || "");
      setProfileImage(user.profileImage || null);
      setInstruments(user.instruments || []);
      setLocation(user.location || "");
      setSkillLevel(user.skillLevel || "");
      setLearningMode(user.learningMode || "");
      setAgeGroup(user.ageGroup || "");
      setAvailability(user.availability || "");
      setGoals(user.goals || "");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load profile");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (!ImagePicker) {
      Alert.alert(
        "Image Picker Not Available",
        "Please install expo-image-picker to change your profile picture:\n\nnpx expo install expo-image-picker"
      );
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant camera roll permissions to change your profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        // TODO: Upload image to backend and get URL
        // For now, we'll just store the local URI
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const toggleInstrument = (instrument: string) => {
    if (instruments.includes(instrument)) {
      setInstruments(instruments.filter((i) => i !== instrument));
    } else {
      setInstruments([...instruments, instrument]);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      setSaving(true);
      await api("/api/users/me", {
        method: "PUT",
        auth: true,
        body: JSON.stringify({
          name: name.trim(),
          instruments,
          location: location.trim(),
          skillLevel,
          learningMode,
          ageGroup,
          availability: availability.trim(),
          goals: goals.trim(),
          // profileImage will be handled separately when backend supports it
        }),
      });

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Text style={styles.headerSubtitle}>Update your personal information</Text>
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
          {/* Profile Picture */}
          <View style={styles.profilePictureSection}>
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profilePicture} />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Ionicons name="person" size={50} color="#FF6A5C" />
                </View>
              )}
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.profilePictureHint}>Tap to change photo</Text>
          </View>

          {/* Name */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />

          {/* Email (Read-only) */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.inputDisabled}
            value={email}
            editable={false}
            placeholder="Email cannot be changed"
          />

          {/* Instruments */}
          <Text style={styles.label}>Instruments You Want to Learn</Text>
          <View style={styles.chipRow}>
            {INSTRUMENT_OPTIONS.map((instrument) => {
              const selected = instruments.includes(instrument);
              return (
                <TouchableOpacity
                  key={instrument}
                  style={styles.chipWrapper}
                  onPress={() => toggleInstrument(instrument)}
                >
                  <LinearGradient
                    colors={selected ? ["#FF9076", "#FF6A5C"] : ["#FFE4DB", "#FFE4DB"]}
                    style={styles.chip}
                  >
                    <Text style={selected ? styles.chipTextSelected : styles.chipText}>
                      {instrument}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Location */}
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. San Francisco, CA"
            value={location}
            onChangeText={setLocation}
          />

          {/* Skill Level */}
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

          {/* Learning Mode */}
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

          {/* Age Group */}
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

          {/* Availability */}
          <Text style={styles.label}>Availability</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Evenings, Weekends"
            value={availability}
            onChangeText={setAvailability}
          />

          {/* Goals/About */}
          <Text style={styles.label}>About me and Learning Goals</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            placeholder="Share what you want to achieve, preferred genres, etc."
            value={goals}
            onChangeText={setGoals}
          />

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={saveProfile}
            disabled={saving}
          >
            <LinearGradient
              colors={saving ? ["#CCCCCC", "#AAAAAA"] : ["#FF9076", "#FF6A5C"]}
              style={styles.saveBtnGradient}
            >
              <Text style={styles.saveText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F3",
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
  },
  profilePictureSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePictureContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE4DB",
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE4DB",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF6A5C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  profilePictureHint: {
    fontSize: 12,
    color: "#666",
  },
  label: {
    marginTop: 15,
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    fontSize: 16,
    color: "#999",
  },
  textArea: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginTop: 6,
    height: 120,
    textAlignVertical: "top",
    fontSize: 16,
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
    marginTop: 30,
    borderRadius: 30,
    overflow: "hidden",
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});

