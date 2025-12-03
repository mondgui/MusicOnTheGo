import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

type LessonCardData = {
  id: number;
  teacher: string;
  instrument: string;
  date: string;
  time: string;
  location: string;
  status: "Confirmed" | "Pending";
  photo: string;
};

const lessonsData: LessonCardData[] = [
  {
    id: 1,
    teacher: "Sarah Mitchell",
    instrument: "Piano",
    date: "Nov 15, 2025",
    time: "2:00 PM",
    location: "San Francisco, CA",
    status: "Confirmed",
    photo: "https://picsum.photos/200",
  },
  {
    id: 2,
    teacher: "Michael Chen",
    instrument: "Guitar",
    date: "Nov 18, 2025",
    time: "4:00 PM",
    location: "Los Angeles, CA",
    status: "Pending",
    photo: "https://picsum.photos/220",
  },
];

export default function LessonsTab() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>My Lessons</Text>

      {lessonsData.map((lesson) => (
        <View key={lesson.id} style={styles.lessonCard}>
          <Image source={{ uri: lesson.photo }} style={styles.lessonImage} />

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{lesson.teacher}</Text>
            <Text style={styles.cardSubtitle}>{lesson.instrument}</Text>
            <Text style={styles.cardDetail}>📅 {lesson.date}</Text>
            <Text style={styles.cardDetail}>⏰ {lesson.time}</Text>
            <Text style={styles.cardDetail}>📍 {lesson.location}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              lesson.status === "Confirmed" ? styles.confirmed : styles.pending,
            ]}
          >
            <Text style={styles.statusText}>{lesson.status}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
  lessonCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    gap: 12,
  },
  lessonImage: {
    width: 55,
    height: 55,
    borderRadius: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSubtitle: { color: "#777", marginTop: 3 },
  cardDetail: { color: "#555", marginTop: 3 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  confirmed: {
    backgroundColor: "#D6FFE1",
  },
  pending: {
    backgroundColor: "#FFF3C4",
  },
  statusText: {
    fontWeight: "600",
    color: "#333",
  },
});

