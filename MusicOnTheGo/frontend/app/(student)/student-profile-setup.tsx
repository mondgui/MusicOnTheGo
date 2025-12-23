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
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
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
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      // Check if user canceled
      if (result.canceled) {
        return;
      }

      // Check if we have an asset
      if (result.assets && result.assets.length > 0 && result.assets[0]?.uri) {
        const imageUri = result.assets[0].uri;
        setProfileImageUri(imageUri);
        
        // Upload image immediately
        setUploadingImage(true);
        try {
          const formData = new FormData();
          formData.append("file", {
            uri: imageUri,
            type: "image/jpeg",
            name: "profile.jpg",
          } as any);

          const uploadResponse = await api("/api/uploads/profile-image", {
            method: "POST",
            auth: true,
            body: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (uploadResponse?.url) {
            // Image uploaded successfully, store the URL to save with profile
            setProfileImageUrl(uploadResponse.url);
          }
        } catch (uploadError: any) {
          Alert.alert("Upload error", uploadError.message || "Failed to upload image");
          setProfileImageUri(null);
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error: any) {
      Alert.alert("Image picker error", error.message || "Failed to pick image");
    }
  };

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
          ...(profileImageUrl && { profileImage: profileImageUrl }),
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
          <TouchableOpacity style={styles.photoCircle} onPress={pickImage} disabled={uploadingImage}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
            ) : (
              <Ionicons name="camera" size={40} color="#FF6A5C" />
            )}
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </TouchableOpacity>

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
  photoCircle: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF2EE",
    borderWidth: 2,
    borderColor: "#FF6A5C",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
