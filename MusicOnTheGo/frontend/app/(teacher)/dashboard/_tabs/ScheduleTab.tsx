import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";

type ScheduleItem = { id: string | number; student: string; instrument: string; time: string };

type Props = {
  schedule: ScheduleItem[];
};

export default function ScheduleTab({ schedule }: Props) {
  return (
    <View style={styles.section}>
      <Card style={styles.scheduleCard}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {schedule.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No lessons scheduled for today</Text>
          </View>
        ) : (
          <View style={styles.scheduleList}>
            {schedule.map((item) => (
              <View key={item.id} style={styles.scheduleItem}>
                <View style={styles.timeIcon}>
                  <Ionicons name="time-outline" size={20} color="white" />
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.studentName}>{item.student}</Text>
                  <Text style={styles.scheduleDetails}>
                    {item.instrument} • {item.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  scheduleCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  scheduleList: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: "#FFF5F3",
    borderRadius: 12,
  },
  timeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FF6A5C",
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleInfo: {
    flex: 1,
    justifyContent: "center",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  scheduleDetails: {
    fontSize: 14,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
  },
});
