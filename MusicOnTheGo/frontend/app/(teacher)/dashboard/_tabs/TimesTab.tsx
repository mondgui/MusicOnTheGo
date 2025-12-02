import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Availability = { day: string; slots: string[] };
type Props = { availability: Availability[] };

export default function TimesTab({ availability }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your Availability</Text>

      {availability.map((day) => (
        <View key={day.day} style={styles.availabilityCard}>
          <Text style={styles.dayTitle}>{day.day}</Text>

          {day.slots.map((slot, index) => (
            <View key={index} style={styles.slotRow}>
              <Ionicons name="time-outline" size={18} color="#FF6A5C" />
              <Text style={styles.slotText}>{slot}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
  availabilityCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
  },
  dayTitle: { fontSize: 17, fontWeight: "700", marginBottom: 8 },
  slotRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  slotText: { fontSize: 15, color: "#555" },
});
