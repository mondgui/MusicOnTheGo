import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";

export default function StudentPortfolioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Helper to safely get string from params (can be string | string[])
  const getParam = (key: string, defaultValue: string = ""): string => {
    const value = params[key];
    if (Array.isArray(value)) return value[0] || defaultValue;
    return value || defaultValue;
  };
  
  // Get student data from params or use mock data
  const student = {
    _id: getParam("studentId", "1"),
    name: getParam("studentName", "Student Name"),
    instrument: getParam("instrument", "Piano"),
    image: getParam("image", ""),
  };

  const mockLessons = [
    {
      id: 1,
      date: "2025-12-01",
      topic: "Scale Mastery - C Major",
      notes: "Great progress on hand position. Keep practicing daily.",
      duration: "60 min",
    },
    {
      id: 2,
      date: "2025-11-24",
      topic: "Fur Elise - Introduction",
      notes: "Learned first section. Work on tempo consistency.",
      duration: "60 min",
    },
    {
      id: 3,
      date: "2025-11-17",
      topic: "Music Theory - Chord Progressions",
      notes: "Understood basic chord structure. Homework assigned.",
      duration: "45 min",
    },
  ];

  const mockGoals = [
    { id: 1, goal: "Master C Major Scale", progress: 80, completed: false },
    { id: 2, goal: "Learn Fur Elise", progress: 40, completed: false },
    { id: 3, goal: "Practice 5 days/week", progress: 100, completed: true },
    { id: 4, goal: "Understand basic music theory", progress: 65, completed: false },
  ];

  const mockPractice = [
    { date: "Dec 1", minutes: 45 },
    { date: "Nov 30", minutes: 60 },
    { date: "Nov 29", minutes: 30 },
    { date: "Nov 28", minutes: 50 },
    { date: "Nov 27", minutes: 40 },
  ];

  const totalLessons = 12;
  const totalPracticeMinutes = mockPractice.reduce((sum, p) => sum + p.minutes, 0);
  const averagePracticeTime = Math.round(totalPracticeMinutes / mockPractice.length);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={["#FF9076", "#FF6A5C"]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          {/* Student Info */}
          <View style={styles.studentInfo}>
            <Avatar
              src={student.image}
              fallback={student.name?.charAt(0) || "S"}
              size={64}
              style={styles.avatar}
            />
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>{student.name || "Student Name"}</Text>
              <Text style={styles.studentMeta}>
                {student.instrument || "Piano"} • {totalLessons} lessons
              </Text>
              <Text style={styles.studentMeta}>Started Nov 2025</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Ionicons name="calendar-outline" size={20} color="#FF6A5C" style={styles.statIcon} />
              <Text style={styles.statValue}>{totalLessons}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="time-outline" size={20} color="#FF9076" style={styles.statIcon} />
              <Text style={styles.statValue}>{totalPracticeMinutes}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="trophy-outline" size={20} color="#FFD700" style={styles.statIcon} />
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </Card>
          </View>

          {/* Tabs */}
          <Tabs defaultValue="progress">
            <TabsList style={styles.tabsList}>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="practice">Practice</TabsTrigger>
            </TabsList>

            {/* Progress Tab */}
            <TabsContent value="progress">
              <View style={styles.tabContent}>
                <Card style={styles.goalsCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="flag-outline" size={20} color="#FF6A5C" />
                    <Text style={styles.cardTitle}>Learning Goals</Text>
                  </View>
                  <View style={styles.goalsList}>
                    {mockGoals.map((goal) => (
                      <View key={goal.id} style={styles.goalItem}>
                        <View style={styles.goalHeader}>
                          <Text style={styles.goalText}>{goal.goal}</Text>
                          <Badge
                            variant={goal.completed ? "success" : "default"}
                          >
                            {goal.progress}%
                          </Badge>
                        </View>
                        <Progress value={goal.progress} style={styles.goalProgress} />
                      </View>
                    ))}
                  </View>
                </Card>

                <Card style={styles.achievementsCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="trophy-outline" size={20} color="#FFD700" />
                    <Text style={styles.cardTitle}>Recent Achievements</Text>
                  </View>
                  <View style={styles.achievementsList}>
                    <Badge variant="warning">🎯 5-Day Streak</Badge>
                    <Badge variant="success">⏰ 100 Minutes</Badge>
                    <Badge>🎵 First Song</Badge>
                    <Badge>📚 Theory Expert</Badge>
                    <Badge>🌟 Dedicated</Badge>
                  </View>
                </Card>
              </View>
            </TabsContent>

            {/* Lessons Tab */}
            <TabsContent value="lessons">
              <View style={styles.tabContent}>
                <View style={styles.lessonsHeader}>
                  <Text style={styles.sectionTitle}>Lesson History</Text>
                  <Badge>{mockLessons.length} recent</Badge>
                </View>
                {mockLessons.map((lesson) => (
                  <Card key={lesson.id} style={styles.lessonCard}>
                    <View style={styles.lessonHeader}>
                      <View style={styles.lessonInfo}>
                        <Text style={styles.lessonTopic}>{lesson.topic}</Text>
                        <Text style={styles.lessonNotes}>{lesson.notes}</Text>
                      </View>
                      <Badge>{lesson.duration}</Badge>
                    </View>
                    <View style={styles.lessonDate}>
                      <Ionicons name="calendar-outline" size={14} color="#666" />
                      <Text style={styles.lessonDateText}>
                        {formatDate(lesson.date)}
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>
            </TabsContent>

            {/* Practice Tab */}
            <TabsContent value="practice">
              <View style={styles.tabContent}>
                <Card style={styles.practiceStatsCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="trending-up-outline" size={20} color="#FF6A5C" />
                    <Text style={styles.cardTitle}>Practice Stats</Text>
                  </View>
                  <View style={styles.practiceStatsGrid}>
                    <View style={styles.practiceStat}>
                      <Text style={styles.practiceStatLabel}>Total This Week</Text>
                      <Text style={styles.practiceStatValue}>{totalPracticeMinutes} min</Text>
                    </View>
                    <View style={styles.practiceStat}>
                      <Text style={styles.practiceStatLabel}>Average Per Day</Text>
                      <Text style={styles.practiceStatValue}>{averagePracticeTime} min</Text>
                    </View>
                  </View>
                </Card>

                <View style={styles.practiceSessions}>
                  <Text style={styles.sectionTitle}>Recent Practice Sessions</Text>
                  {mockPractice.map((session, index) => (
                    <Card key={index} style={styles.practiceSessionCard}>
                      <View style={styles.practiceSessionRow}>
                        <View style={styles.practiceSessionInfo}>
                          <Ionicons name="time-outline" size={16} color="#FF6A5C" />
                          <Text style={styles.practiceSessionDate}>{session.date}</Text>
                        </View>
                        <Badge>{session.minutes} min</Badge>
                      </View>
                    </Card>
                  ))}
                </View>
              </View>
            </TabsContent>
          </Tabs>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F3",
  },
  scrollView: {
    flex: 1,
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
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    borderWidth: 4,
    borderColor: "white",
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  studentMeta: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginBottom: 2,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  tabsList: {
    marginBottom: 16,
  },
  tabContent: {
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  goalsCard: {
    padding: 16,
  },
  goalsList: {
    gap: 16,
  },
  goalItem: {
    gap: 8,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  goalProgress: {
    marginTop: 4,
  },
  achievementsCard: {
    padding: 16,
  },
  achievementsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  lessonsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  lessonCard: {
    padding: 16,
    marginBottom: 12,
  },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  lessonInfo: {
    flex: 1,
    marginRight: 12,
  },
  lessonTopic: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  lessonNotes: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  lessonDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lessonDateText: {
    fontSize: 12,
    color: "#666",
  },
  practiceStatsCard: {
    padding: 16,
  },
  practiceStatsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  practiceStat: {
    flex: 1,
  },
  practiceStatLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  practiceStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  practiceSessions: {
    gap: 12,
  },
  practiceSessionCard: {
    padding: 12,
  },
  practiceSessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  practiceSessionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  practiceSessionDate: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
});

