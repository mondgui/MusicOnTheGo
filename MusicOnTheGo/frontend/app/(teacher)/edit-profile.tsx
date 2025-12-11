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
import * as ImagePicker from "expo-image-picker";
import { api } from "../../lib/api";
import { Badge } from "@/components/ui/badge";

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

const EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

const SPECIALTY_OPTIONS = [
  "Beginners Welcome",
  "Music Theory",
  "Performance Prep",
  "Sight Reading",
  "Ear Training",
  "Composition",
  "Jazz",
  "Classical",
  "Pop/Rock",
  "Online Teaching",
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
  const [experience, setExperience] = useState("");
  const [rate, setRate] = useState("");
  const [about, setAbout] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState("");

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
      setExperience(user.experience || "");
      setRate(user.rate ? user.rate.toString() : "");
      setAbout(user.about || "");
      setSpecialties(user.specialties || []);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load profile");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Please grant camera roll permissions to change your profile picture."
          );
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      // Check if user canceled
      if (result.canceled) {
        return; // User canceled, no error
      }

      // Check if we have an asset
      if (result.assets && result.assets.length > 0 && result.assets[0]?.uri) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
      } else {
        Alert.alert("Error", "No image was selected. Please try again.");
      }
    } catch (err: any) {
      console.error("Image picker error:", err);
      const errorMessage = err?.message || err?.toString() || "Unknown error";
      Alert.alert(
        "Error",
        `Failed to pick image: ${errorMessage}. Please try again.`
      );
    }
  };

  const toggleInstrument = (instrument: string) => {
    if (instruments.includes(instrument)) {
      setInstruments(instruments.filter((i) => i !== instrument));
    } else {
      setInstruments([...instruments, instrument]);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter((s) => s !== specialty));
    } else {
      setSpecialties([...specialties, specialty]);
    }
  };

  const addCustomSpecialty = () => {
    const trimmed = customSpecialty.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      setSpecialties([...specialties, trimmed]);
      setCustomSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter((s) => s !== specialty));
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
          experience: experience.trim(),
          rate: rate ? parseFloat(rate) : undefined,
          about: about.trim(),
          profileImage: profileImage || "",
          specialties,
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
          <Text style={styles.label}>Instruments You Teach</Text>
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

          {/* Experience */}
          <Text style={styles.label}>Teaching Experience</Text>
          <View style={styles.chipRow}>
            {EXPERIENCE_OPTIONS.map((option) => {
              const selected = experience === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.chipWrapper}
                  onPress={() => setExperience(option)}
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

          {/* Hourly Rate */}
          <Text style={styles.label}>Hourly Rate ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 45"
            value={rate}
            onChangeText={setRate}
            keyboardType="numeric"
          />

          {/* Specialties */}
          <Text style={styles.label}>Specialties (Select all that apply)</Text>
          <View style={styles.badgesContainer}>
            {SPECIALTY_OPTIONS.map((specialty) => (
              <TouchableOpacity
                key={specialty}
                onPress={() => toggleSpecialty(specialty)}
                style={styles.badgeWrapper}
              >
                <Badge
                  variant={specialties.includes(specialty) ? "default" : "secondary"}
                >
                  {specialty}
                </Badge>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Specialty Input */}
          <View style={styles.customSpecialtyRow}>
            <TextInput
              style={styles.customSpecialtyInput}
              placeholder="Add your own specialty..."
              value={customSpecialty}
              onChangeText={setCustomSpecialty}
              onSubmitEditing={addCustomSpecialty}
            />
            <TouchableOpacity
              style={styles.addCustomButton}
              onPress={addCustomSpecialty}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Selected Specialties with Remove Option */}
          {specialties.length > 0 && (
            <View style={styles.selectedSpecialtiesContainer}>
              <Text style={styles.selectedLabel}>Selected Specialties:</Text>
              <View style={styles.selectedBadgesContainer}>
                {specialties.map((specialty, index) => (
                  <View key={index} style={styles.selectedBadgeWrapper}>
                    <Badge variant="default">{specialty}</Badge>
                    <TouchableOpacity
                      onPress={() => removeSpecialty(specialty)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={18} color="#FF6A5C" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* About/Bio */}
          <Text style={styles.label}>About Me</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            placeholder="Tell students about your experience, teaching style, specialties, etc."
            value={about}
            onChangeText={setAbout}
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
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  badgeWrapper: {
    marginBottom: 4,
  },
  customSpecialtyRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    alignItems: "center",
  },
  customSpecialtyInput: {
    flex: 1,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    fontSize: 14,
  },
  addCustomButton: {
    backgroundColor: "#FF6A5C",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedSpecialtiesContainer: {
    marginTop: 16,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  selectedBadgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedBadgeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  removeButton: {
    marginLeft: 2,
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

