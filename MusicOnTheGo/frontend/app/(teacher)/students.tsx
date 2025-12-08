import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { api } from "../../lib/api";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type Student = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  instrument?: string;
  totalLessons: number;
  firstLessonDate?: string;
};

export default function StudentsScreen() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch students from bookings
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const bookings = await api("/api/bookings/teacher/me", { auth: true });
      
      // Group bookings by student and extract unique students
      const studentMap = new Map<string, {
        student: any;
        bookings: any[];
      }>();

      (Array.isArray(bookings) ? bookings : []).forEach((booking: any) => {
        if (booking.student) {
          // Handle both populated student object and student ID string
          const studentId = booking.student._id 
            ? String(booking.student._id) 
            : String(booking.student);
          
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              student: booking.student,
              bookings: [],
            });
          }
          studentMap.get(studentId)!.bookings.push(booking);
        }
      });

      // Transform to student list with stats
      const studentsList: Student[] = Array.from(studentMap.values()).map(({ student, bookings }) => {
        // Get the first lesson date (oldest booking)
        const sortedBookings = bookings.sort((a, b) => {
          const dateA = new Date(a.day || a.createdAt || 0).getTime();
          const dateB = new Date(b.day || b.createdAt || 0).getTime();
          return dateA - dateB;
        });
        const firstLessonDate = sortedBookings[0]?.day || sortedBookings[0]?.createdAt;

        // Get instrument from teacher or first booking
        const instrument = bookings[0]?.teacher?.instruments?.[0] || "Music";

        // Ensure _id is a string
        const studentId = student._id ? String(student._id) : String(student);

        return {
          _id: studentId,
          name: student.name || "Student",
          email: student.email || "",
          profileImage: student.profileImage,
          instrument,
          totalLessons: bookings.length,
          firstLessonDate,
        };
      });

      // Sort by name
      studentsList.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(studentsList);
    } catch (err) {
      console.error("Failed to load students", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [loadStudents])
  );

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      // Check if it's a day name
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      if (dayNames.includes(dateString)) {
        // Convert day name to next occurrence date
        const dayIndex = dayNames.indexOf(dateString);
        const today = new Date();
        const currentDay = today.getDay();
        let daysUntil = dayIndex - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntil);
        return nextDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const handleStudentPress = (student: Student) => {
    router.push({
      pathname: "/(teacher)/student-portfolio",
      params: {
        studentId: student._id,
        studentName: student.name,
        instrument: student.instrument || "Music",
        image: student.profileImage || "",
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Students</Text>
        <Text style={styles.headerSubtitle}>
          {students.length} {students.length === 1 ? "student" : "students"}
        </Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6A5C" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        ) : students.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No students yet</Text>
            <Text style={styles.emptySubtext}>
              Students will appear here once they book lessons with you
            </Text>
          </View>
        ) : (
          <View style={styles.studentsList}>
            {students.map((student) => (
              <Card
                key={student._id}
                style={styles.studentCard}
                onPress={() => handleStudentPress(student)}
              >
                <View style={styles.studentCardContent}>
                  <Avatar
                    src={student.profileImage}
                    fallback={student.name.charAt(0)}
                    size={56}
                  />
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <View style={styles.studentMeta}>
                      <Text style={styles.studentInstrument}>
                        {student.instrument}
                      </Text>
                      <Text style={styles.studentSeparator}>•</Text>
                      <Text style={styles.studentLessons}>
                        {student.totalLessons}{" "}
                        {student.totalLessons === 1 ? "lesson" : "lessons"}
                      </Text>
                    </View>
                    <Text style={styles.studentDate}>
                      Started {formatDate(student.firstLessonDate)}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color="#CCC"
                  />
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F3",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  studentsList: {
    padding: 20,
    gap: 12,
  },
  studentCard: {
    padding: 16,
  },
  studentCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  studentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  studentInstrument: {
    fontSize: 14,
    color: "#666",
  },
  studentSeparator: {
    fontSize: 14,
    color: "#999",
  },
  studentLessons: {
    fontSize: 14,
    color: "#666",
  },
  studentDate: {
    fontSize: 12,
    color: "#999",
  },
});

