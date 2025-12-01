// frontend/app/register-student.tsx

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
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../lib/api";
import * as SecureStore from "expo-secure-store";

const INSTRUMENT_OPTIONS = [
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
  { label: "Banjo", value: "banjo" },
  { label: "Accordion", value: "accordion" },
  { label: "Oboe", value: "oboe" },
  { label: "Mandolin", value: "mandolin" },
  { label: "Synthesizer / Keyboard", value: "synth" },
  { label: "Percussion (General)", value: "percussion" },
  { label: "Harp", value: "harp" },
];

export default function RegisterStudent() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [otherInstrument, setOtherInstrument] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleInstrument = (value: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleContinue = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const custom = otherInstrument.trim();
    const allInstruments = [...selectedInstruments, ...(custom ? [custom] : [])];

    if (allInstruments.length === 0) {
      alert("Please select at least one instrument you want to learn.");
      return;
    }

    try {
      setLoading(true);

      const response = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: "student",
          instruments: allInstruments,
          location,
        }),
      });

      if (response?.token) {
        await SecureStore.setItemAsync("token", response.token);
      }

      router.push({
        pathname: "/student-profile-setup",
        params: {
          fullName,
          instruments: JSON.stringify(allInstruments),
          location,
        },
      });
    } catch (error: any) {
      alert(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Text style={styles.label}>Instrument(s) You Want to Learn</Text>
          <View style={styles.chipRow}>
            {INSTRUMENT_OPTIONS.map((option) => {
              const selected = selectedInstruments.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.chipWrapper}
                  onPress={() => toggleInstrument(option.value)}
                  activeOpacity={0.8}
                >
                  {selected ? (
                    <LinearGradient
                      colors={["#FF9076", "#FF6A5C"]}
                      style={styles.chip}
                    >
                      <Text style={styles.chipTextSelected}>{option.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.chip, styles.chipUnselected]}>
                      <Text style={styles.chipText}>{option.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Other instruments not listed above</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Viola, Bassoon, Marimba, ukulele, etc."
            value={otherInstrument}
            onChangeText={setOtherInstrument}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="City, State"
            value={location}
            onChangeText={setLocation}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? "Please wait..." : "Continue"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.footerLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F7F7F7",
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#E0E0E0",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  chipWrapper: {
    marginRight: 8,
    marginBottom: 8,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipUnselected: {
    backgroundColor: "#FFE4DB",
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





// // frontend/app/register-student.tsx

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
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { api } from "../lib/api";
// import * as SecureStore from "expo-secure-store";

// const INSTRUMENT_OPTIONS = [
//   { label: "Piano", value: "piano" },
//   { label: "Guitar", value: "guitar" },
//   { label: "Violin", value: "violin" },
//   { label: "Voice / Singing", value: "voice" },
//   { label: "Drums", value: "drums" },
//   { label: "Bass", value: "bass" },
//   { label: "Saxophone", value: "saxophone" },
//   { label: "Flute", value: "flute" },
//   { label: "Trumpet", value: "trumpet" },
//   { label: "Clarinet", value: "clarinet" },
//   { label: "Cello", value: "cello" },
//   { label: "Ukulele", value: "ukulele" },
// ];

// export default function RegisterStudent() {
//   const router = useRouter();

//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [location, setLocation] = useState("");
//   const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
//   const [otherInstrument, setOtherInstrument] = useState("");
//   const [loading, setLoading] = useState(false);

//   const toggleInstrument = (value: string) => {
//     setSelectedInstruments((prev) =>
//       prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
//     );
//   };

//   const handleContinue = async () => {
//     if (!fullName || !email || !password || !confirmPassword) {
//       alert("Please fill in all required fields.");
//       return;
//     }

//     if (password !== confirmPassword) {
//       alert("Passwords do not match.");
//       return;
//     }

//     const custom = otherInstrument.trim();
//     const allInstruments = [...selectedInstruments, ...(custom ? [custom] : [])];

//     if (allInstruments.length === 0) {
//       alert("Please select at least one instrument you want to learn.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await api("/api/auth/register", {
//         method: "POST",
//         body: JSON.stringify({
//           name: fullName,
//           email,
//           password,
//           role: "student",
//           instruments: allInstruments,
//           location,
//         }),
//       });

//       if (response?.token) {
//         await SecureStore.setItemAsync("token", response.token);
//       }

//       router.push({
//         pathname: "/student-profile-setup",
//         params: {
//           fullName,
//           instruments: JSON.stringify(allInstruments),
//           location,
//         },
//       });
//     } catch (error: any) {
//       alert(error.message || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={24} color="white" />
//         </TouchableOpacity>

//         <Ionicons
//           name="school-outline"
//           size={40}
//           color="white"
//           style={{ alignSelf: "center", marginBottom: 10 }}
//         />

//         <Text style={styles.headerTitle}>Student Registration</Text>
//         <Text style={styles.headerSubtitle}>Create your account to begin learning</Text>
//       </LinearGradient>

//       <ScrollView contentContainerStyle={styles.formContainer}>
//         <Text style={styles.label}>Full Name</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter your name"
//           value={fullName}
//           onChangeText={setFullName}
//         />

//         <Text style={styles.label}>Email</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="your@email.com"
//           value={email}
//           onChangeText={setEmail}
//           autoCapitalize="none"
//           keyboardType="email-address"
//         />

//         <Text style={styles.label}>Password</Text>
//         <TextInput
//           style={styles.input}
//           secureTextEntry
//           placeholder="Create a password"
//           value={password}
//           onChangeText={setPassword}
//         />

//         <Text style={styles.label}>Confirm Password</Text>
//         <TextInput
//           style={styles.input}
//           secureTextEntry
//           placeholder="Confirm your password"
//           value={confirmPassword}
//           onChangeText={setConfirmPassword}
//         />

//         <Text style={styles.label}>Instrument(s) You Want to Learn</Text>
//         <View style={styles.chipRow}>
//           {INSTRUMENT_OPTIONS.map((option) => {
//             const selected = selectedInstruments.includes(option.value);
//             return (
//               <TouchableOpacity
//                 key={option.value}
//                 style={styles.chipWrapper}
//                 onPress={() => toggleInstrument(option.value)}
//                 activeOpacity={0.8}
//               >
//                 {selected ? (
//                   <LinearGradient
//                     colors={["#FF9076", "#FF6A5C"]}
//                     style={styles.chip}
//                   >
//                     <Text style={styles.chipTextSelected}>{option.label}</Text>
//                   </LinearGradient>
//                 ) : (
//                   <View style={[styles.chip, styles.chipUnselected]}>
//                     <Text style={styles.chipText}>{option.label}</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             );
//           })}
//         </View>

//         <Text style={styles.label}>Other instruments not listed above</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="e.g. Viola, Bassoon, Marimba, ukulele, etc."
//           value={otherInstrument}
//           onChangeText={setOtherInstrument}
//         />

//         <Text style={styles.label}>Location</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="City, State"
//           value={location}
//           onChangeText={setLocation}
//         />

//         <TouchableOpacity
//           style={styles.submitButton}
//           onPress={handleContinue}
//           disabled={loading}
//         >
//           <Text style={styles.submitText}>
//             {loading ? "Please wait..." : "Continue"}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => router.push("/login")}>
//           <Text style={styles.footerText}>
//             Already have an account?{" "}
//             <Text style={styles.footerLink}>Log in</Text>
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// /* ---------- STYLES ---------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "white" },

//   header: {
//     paddingTop: 60,
//     paddingBottom: 40,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },

//   backButton: { width: 40, marginBottom: 10 },

//   headerTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "white",
//     textAlign: "center",
//   },

//   headerSubtitle: {
//     fontSize: 14,
//     color: "white",
//     opacity: 0.9,
//     textAlign: "center",
//   },

//   formContainer: { paddingHorizontal: 20, paddingVertical: 20 },

//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginTop: 15,
//     marginBottom: 6,
//   },

//   input: {
//     backgroundColor: "#F7F7F7",
//     padding: 14,
//     borderWidth: 1,
//     borderRadius: 10,
//     borderColor: "#E0E0E0",
//   },

//   chipRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginTop: 4,
//   },
//   chipWrapper: {
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   chip: {
//     borderRadius: 20,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//   },
//   chipUnselected: {
//     backgroundColor: "#FFE4DB",
//   },
//   chipText: {
//     fontSize: 13,
//     color: "#FF6A5C",
//     fontWeight: "600",
//   },
//   chipTextSelected: {
//     fontSize: 13,
//     color: "white",
//     fontWeight: "700",
//   },

//   submitButton: {
//     backgroundColor: "#FF6A5C",
//     paddingVertical: 16,
//     borderRadius: 30,
//     marginTop: 30,
//     alignItems: "center",
//   },

//   submitText: { color: "white", fontSize: 17, fontWeight: "700" },

//   footerText: { textAlign: "center", marginTop: 15, color: "#555" },

//   footerLink: { color: "#FF6A5C", fontWeight: "600" },
// });
