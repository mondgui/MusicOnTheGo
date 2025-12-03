import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ScheduleItem = { id: string | number; student: string; instrument: string; time: string };

type Props = {
  schedule: ScheduleItem[];
  onBookingRequestsPress?: () => void;
  onCreateAvailabilityPress?: () => void;
};

export default function ScheduleTab({ schedule, onBookingRequestsPress, onCreateAvailabilityPress }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => onCreateAvailabilityPress?.()}
          disabled={!onCreateAvailabilityPress}
        >
          <View style={styles.quickIcon}>
            <Ionicons name="calendar-outline" size={22} color="white" />
          </View>
          <Text style={styles.quickText}>Create availability</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => onBookingRequestsPress?.()}
          disabled={!onBookingRequestsPress}
        >
          <View style={styles.quickIcon}>
            <Ionicons name="clipboard-outline" size={22} color="white" />
          </View>
          <Text style={styles.quickText}>Booking requests</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Today&apos;s Schedule</Text>

      {schedule.map((item) => (
        <View key={item.id} style={styles.lessonCardRow}>
          <View style={styles.lessonIconCircle}>
            <Ionicons name="time-outline" size={22} color="#FF6A5C" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.student}</Text>
            <Text style={styles.cardSubtitle}>
              {item.instrument} • {item.time}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
  quickRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  quickCard: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 14,
    marginRight: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FF6A5C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickText: { fontWeight: "600", color: "#333" },
  lessonCardRow: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    alignItems: "center",
    gap: 12,
  },
  lessonIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFE0D6",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSubtitle: { color: "#777", marginTop: 3 },
});
