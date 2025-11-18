import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TeacherDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🎼 Teacher Dashboard</Text>
      <Text style={styles.subtitle}>Manage students, availability & schedule here.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#555",
  },
});
