import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function TeacherDashboard() {
  return (
    <LinearGradient colors={["#9333EA", "#6366F1"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Teacher Panel 🎵</Text>
        <Text style={styles.subtitle}>Manage your schedule and bookings</Text>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(teacher)/set-availability")}
        >
          <Ionicons name="time-outline" size={32} color="#9333EA" />
          <Text style={styles.cardText}>Set Availability</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(teacher)/my-bookings")}
        >
          <Ionicons name="people-outline" size={32} color="#9333EA" />
          <Text style={styles.cardText}>My Bookings</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { marginTop: 70, marginBottom: 30 },
  title: { fontSize: 32, fontWeight: "700", color: "white" },
  subtitle: { fontSize: 18, color: "white", marginTop: 6 },
  cardContainer: { marginTop: 20 },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardText: { fontSize: 18, fontWeight: "600" },
});
