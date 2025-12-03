import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function ProfileTab() {
  return (
    <View style={styles.section}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={{ uri: "https://picsum.photos/200" }}
          style={styles.profileAvatar}
        />
        <Text style={styles.profileName}>Your Name</Text>
        <Text style={styles.profileEmail}>student@email.com</Text>
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
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },
  profileEmail: {
    color: "#666",
    marginTop: 5,
  },
  profileButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  profileButtonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#333",
  },
});

