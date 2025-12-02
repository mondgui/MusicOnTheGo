import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

type Props = {
  name?: string;
  email?: string;
  instruments?: string[];
  rate?: number;
};

export default function TeacherProfileTab({ name, email, instruments, rate }: Props) {
  return (
    <View style={styles.section}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={{ uri: "https://picsum.photos/250" }}
          style={styles.profileAvatar}
        />
        <Text style={styles.profileName}>{name || "Your Name"}</Text>
        <Text style={styles.profileEmail}>{email || "email@example.com"}</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Instrument(s)</Text>
        <Text style={styles.profileValue}>
          {instruments?.length ? instruments.join(", ") : "Not set"}
        </Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Rate</Text>
        <Text style={styles.profileValue}>{rate ? `$${rate}/hour` : "Not set"}</Text>
      </View>

      <View style={styles.profileButton}>
        <Text style={styles.profileButtonText}>Edit Profile</Text>
      </View>

      <View style={styles.profileButton}>
        <Text style={styles.profileButtonText}>Log Out</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 30 },
  profileAvatar: { width: 80, height: 80, borderRadius: 40 },
  profileName: { fontSize: 20, fontWeight: "700", marginTop: 10 },
  profileEmail: { color: "#666", marginTop: 5 },
  profileCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  profileLabel: { fontWeight: "700", marginBottom: 4, color: "#444" },
  profileValue: { color: "#666" },
  profileButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  profileButtonText: { textAlign: "center", fontWeight: "600", color: "#333" },
});
