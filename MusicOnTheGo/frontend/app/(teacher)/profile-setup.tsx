// // frontend/app/profile-setup.tsx

// frontend/app/profile-setup.tsx
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
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/badge";

export default function ProfileSetup() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const fullName = (params.fullName as string) || "";
  const instruments =
    (params.instruments && JSON.parse(params.instruments as string)) || [];
  const location = (params.location as string) || "";

  const [experience, setExperience] = useState("");
  const [rate, setRate] = useState("");
  const [about, setAbout] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState("");

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
    try {
      await api("/api/users/me", {
        method: "PUT",
        auth: true,
        body: JSON.stringify({
          instruments,
          location,
          experience,
          rate: rate ? Number(rate) : undefined,
          about,
          specialties,
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
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Add final details to continue</Text>
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
          <TouchableOpacity style={styles.photoCircle}>
            <Ionicons name="camera" size={40} color="#FF6A5C" />
          </TouchableOpacity>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.inputDisabled} value={fullName} editable={false} />

          <Text style={styles.label}>Primary Instrument(s)</Text>
          <TextInput
            style={styles.inputDisabled}
            value={instruments.join(", ")}
            editable={false}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.inputDisabled}
            value={location}
            editable={false}
          />

          <Text style={styles.label}>Experience (years)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5"
            value={experience}
            onChangeText={setExperience}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Rate per hour ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 40"
            value={rate}
            onChangeText={setRate}
            keyboardType="numeric"
          />

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

          <Text style={styles.label}>About Me</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            placeholder="Tell the students about your teaching style..."
            value={about}
            onChangeText={setAbout}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
            <Text style={styles.saveText}>Finish and create profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* STYLES */
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
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 10,
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
  saveBtn: {
    backgroundColor: "#FF6A5C",
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 30,
    alignItems: "center",
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "700" },
});







// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { api } from "../../lib/api";
// import { Ionicons } from "@expo/vector-icons";
// import * as SecureStore from "expo-secure-store";

// export default function ProfileSetup() {
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   const fullName = (params.fullName as string) || "";
//   const instrumentsParam = (params.instruments as string) || "[]";
//   const instruments: string[] = JSON.parse(instrumentsParam);
//   const location = (params.location as string) || "";
//   const experience = (params.experience as string) || "";

//   const [rate, setRate] = useState("");
//   const [about, setAbout] = useState("");

//   const saveProfile = async () => {
//     try {
//       await api("/api/users/me", {
//         method: "PUT",
//         auth: true,
//         body: JSON.stringify({
//           rate: rate ? Number(rate) : undefined,
//           about,
//         }),
//       });

//       // After finishing profile, log them out and send to login
//       await SecureStore.deleteItemAsync("token");
//       alert("Profile saved! Please log in to access your teacher dashboard.");
//       router.replace("/login");
//     } catch (e: any) {
//       alert(e.message || "Failed to save profile.");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
//         <Text style={styles.title}>Complete Your Profile</Text>
//         <Text style={styles.subtitle}>Add final details to continue</Text>
//       </LinearGradient>

//       <ScrollView contentContainerStyle={styles.content}>
//         {/* PROFILE PHOTO (static for now) */}
//         <View style={styles.photoWrapper}>
//           <View style={styles.photoCircle}>
//             <Ionicons name="camera" size={40} color="#FF6A5C" />
//           </View>
//           <Text style={styles.photoLabel}>Add Profile Photo</Text>
//         </View>

//         {/* READONLY FIELDS FROM STEP 1 */}
//         <Text style={styles.label}>Full Name</Text>
//         <TextInput style={styles.inputDisabled} value={fullName} editable={false} />

//         <Text style={styles.label}>Instrument(s) You Teach</Text>
//         <TextInput
//           style={styles.inputDisabled}
//           value={instruments.join(", ")}
//           editable={false}
//         />

//         <Text style={styles.label}>Location</Text>
//         <TextInput
//           style={styles.inputDisabled}
//           value={location}
//           editable={false}
//         />

//         <Text style={styles.label}>Experience (years)</Text>
//         <TextInput
//           style={styles.inputDisabled}
//           value={experience}
//           editable={false}
//         />

//         {/* EDITABLE FIELDS */}
//         <Text style={styles.label}>Rate per hour ($)</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="e.g. 40"
//           value={rate}
//           onChangeText={setRate}
//           keyboardType="numeric"
//         />

//         <Text style={styles.label}>About Me</Text>
//         <TextInput
//           style={styles.textArea}
//           multiline
//           numberOfLines={5}
//           placeholder="Tell students about your experience and teaching style..."
//           value={about}
//           onChangeText={setAbout}
//         />

//         <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
//           <Text style={styles.saveText}>Save Profile &amp; Create Account</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// /* STYLES */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "white" },

//   header: {
//     paddingTop: 60,
//     paddingBottom: 40,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "white",
//     textAlign: "center",
//   },

//   subtitle: {
//     color: "white",
//     opacity: 0.9,
//     textAlign: "center",
//     marginTop: 5,
//   },

//   content: { paddingHorizontal: 20, paddingBottom: 50 },

//   photoWrapper: {
//     alignItems: "center",
//     marginTop: 20,
//     marginBottom: 20,
//   },

//   photoCircle: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: "#FFF2EE",
//     borderWidth: 2,
//     borderColor: "#FF6A5C",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   photoLabel: {
//     marginTop: 8,
//     color: "#777",
//   },

//   label: {
//     marginTop: 15,
//     fontWeight: "600",
//     fontSize: 14,
//   },

//   input: {
//     backgroundColor: "#F5F5F5",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 6,
//   },

//   inputDisabled: {
//     backgroundColor: "#EDEDED",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 6,
//     color: "#777",
//   },

//   textArea: {
//     backgroundColor: "#F5F5F5",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 6,
//     height: 120,
//     textAlignVertical: "top",
//   },

//   saveBtn: {
//     backgroundColor: "#FF6A5C",
//     paddingVertical: 15,
//     borderRadius: 30,
//     marginTop: 30,
//     alignItems: "center",
//   },
//   saveText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "700",
//     textAlign: "center",
//   },
// });
