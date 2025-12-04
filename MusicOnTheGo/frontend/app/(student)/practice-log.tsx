import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface PracticeEntry {
  id: number;
  date: string;
  minutes: number;
  focus: string;
  notes: string;
}

interface Recording {
  id: number;
  date: string;
  title: string;
  duration: string;
  hasTeacherFeedback: boolean;
  teacherNotes?: string;
}

interface Goal {
  id: number;
  title: string;
  targetDate: string;
  progress: number;
  category: string;
}

export default function PracticeLogScreen() {
  const router = useRouter();

  const [practiceEntries, setPracticeEntries] = useState<PracticeEntry[]>([
    {
      id: 1,
      date: "2025-12-01",
      minutes: 45,
      focus: "Scales & Arpeggios",
      notes: "Worked on C major scale",
    },
    {
      id: 2,
      date: "2025-12-02",
      minutes: 60,
      focus: "Song Practice",
      notes: "Practiced Fur Elise",
    },
    {
      id: 3,
      date: "2025-11-30",
      minutes: 30,
      focus: "Technique",
      notes: "Finger exercises",
    },
    {
      id: 4,
      date: "2025-11-29",
      minutes: 50,
      focus: "Song Practice",
      notes: "New piece - Moonlight Sonata",
    },
    {
      id: 5,
      date: "2025-11-28",
      minutes: 40,
      focus: "Scales & Arpeggios",
      notes: "Minor scales practice",
    },
  ]);

  const [recordings, setRecordings] = useState<Recording[]>([
    {
      id: 1,
      date: "2025-12-02",
      title: "Fur Elise - Practice Run",
      duration: "2:45",
      hasTeacherFeedback: true,
      teacherNotes:
        "Great improvement on tempo! Work on dynamics in measures 12-16. Keep up the good work! 🎵",
    },
    {
      id: 2,
      date: "2025-12-01",
      title: "C Major Scale",
      duration: "1:20",
      hasTeacherFeedback: false,
    },
    {
      id: 3,
      date: "2025-11-29",
      title: "Moonlight Sonata - Section A",
      duration: "3:15",
      hasTeacherFeedback: true,
      teacherNotes:
        "Nice start! Focus on the left hand rhythm. Try practicing hands separately first.",
    },
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      title: "Master Fur Elise",
      targetDate: "2025-12-15",
      progress: 75,
      category: "Repertoire",
    },
    {
      id: 2,
      title: "Learn all major scales",
      targetDate: "2026-01-01",
      progress: 60,
      category: "Technique",
    },
    {
      id: 3,
      title: "Perform at recital",
      targetDate: "2025-12-20",
      progress: 50,
      category: "Performance",
    },
  ]);

  const [minutes, setMinutes] = useState("");
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("");

  // Calculate stats
  const totalMinutes = practiceEntries.reduce((sum, entry) => sum + entry.minutes, 0);
  const weeklyGoal = 180; // 3 hours per week
  const weeklyProgress = Math.min((totalMinutes / weeklyGoal) * 100, 100);
  const streak = 5; // Mock streak count

  const handleAddEntry = () => {
    if (!minutes || !focus) {
      Alert.alert("Error", "Please fill in required fields");
      return;
    }

    const newEntry: PracticeEntry = {
      id: practiceEntries.length + 1,
      date: new Date().toISOString().split("T")[0],
      minutes: parseInt(minutes),
      focus,
      notes,
    };

    setPracticeEntries([newEntry, ...practiceEntries]);
    setMinutes("");
    setFocus("");
    setNotes("");
    setIsDialogOpen(false);
    Alert.alert("Success", `Logged ${minutes} minutes of practice!`);
  };

  const handleAddGoal = () => {
    if (!newGoalTitle || !newGoalDate || !newGoalCategory) {
      Alert.alert("Error", "Please fill in all goal fields");
      return;
    }

    const newGoal: Goal = {
      id: goals.length + 1,
      title: newGoalTitle,
      targetDate: newGoalDate,
      progress: 0,
      category: newGoalCategory,
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle("");
    setNewGoalDate("");
    setNewGoalCategory("");
    setIsGoalDialogOpen(false);
    Alert.alert("Success", "Goal added successfully!");
  };

  const handleUploadRecording = () => {
    Alert.alert("Success", "Recording uploaded! Your teacher will review it soon.");
    setIsUploadDialogOpen(false);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#FF6A5C", "#FF9076"]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice & Progress</Text>
        <Text style={styles.headerSubtitle}>
          Track practice, goals, and recordings
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="time-outline" size={16} color="#FF6A5C" />
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <Text style={styles.statValue}>{totalMinutes} min</Text>
            <Text style={styles.statSubtext}>Goal: {weeklyGoal} min</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="trophy-outline" size={16} color="#FFB800" />
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <Text style={styles.statValue}>{streak} days</Text>
            <Text style={styles.statSubtext}>Keep it up!</Text>
          </Card>
        </View>

        {/* Tabs */}
        <Tabs defaultValue="practice">
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
          </TabsList>

          {/* Practice Tab */}
          <TabsContent value="practice">
            {/* Weekly Progress */}
            <Card style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.progressTitleRow}>
                  <Ionicons name="flag-outline" size={20} color="#FF6A5C" />
                  <Text style={styles.progressTitle}>Weekly Goal</Text>
                </View>
                <Text style={styles.progressPercent}>
                  {Math.round(weeklyProgress)}%
                </Text>
              </View>
              <Progress value={weeklyProgress} style={styles.progressBar} />
              <Text style={styles.progressText}>
                {weeklyGoal - totalMinutes > 0
                  ? `${weeklyGoal - totalMinutes} minutes to go!`
                  : "Goal achieved! 🎉"}
              </Text>
            </Card>

            {/* Add Practice Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button style={styles.addButton}>
                  <Ionicons name="add" size={18} color="white" />
                  <Text style={styles.addButtonText}>Log Practice Session</Text>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Practice Session</DialogTitle>
                </DialogHeader>
                <View style={styles.dialogForm}>
                  <View style={styles.formGroup}>
                    <Label>Minutes Practiced *</Label>
                    <Input
                      keyboardType="numeric"
                      placeholder="30"
                      value={minutes}
                      onChangeText={setMinutes}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Label>Focus Area *</Label>
                    <Input
                      placeholder="e.g., Scales, Song Practice, Technique"
                      value={focus}
                      onChangeText={setFocus}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Label>Notes (Optional)</Label>
                    <TextInput
                      style={styles.textArea}
                      multiline
                      numberOfLines={4}
                      placeholder="What did you work on?"
                      value={notes}
                      onChangeText={setNotes}
                    />
                  </View>
                  <Button onPress={handleAddEntry} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save Practice Log</Text>
                  </Button>
                </View>
              </DialogContent>
            </Dialog>

            {/* Practice History */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Sessions</Text>
              {practiceEntries.map((entry) => (
                <Card key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryInfo}>
                      <Text style={styles.entryFocus}>{entry.focus}</Text>
                      <Text style={styles.entryNotes}>{entry.notes}</Text>
                    </View>
                    <Badge variant="default">{entry.minutes} min</Badge>
                  </View>
                  <View style={styles.entryDateRow}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text style={styles.entryDate}>
                      {formatDate(entry.date)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>

            {/* Achievements */}
            <Card style={styles.achievementsCard}>
              <View style={styles.achievementsHeader}>
                <Ionicons name="trophy-outline" size={20} color="#FFB800" />
                <Text style={styles.achievementsTitle}>Badges Earned</Text>
              </View>
              <View style={styles.badgesRow}>
                <Badge variant="warning">🎯 5-Day Streak</Badge>
                <Badge variant="success">⏰ 100 Minutes</Badge>
                <Badge variant="default">🎵 Dedicated Learner</Badge>
              </View>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button style={styles.addButton}>
                  <Ionicons name="add" size={18} color="white" />
                  <Text style={styles.addButtonText}>Add New Goal</Text>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set a New Goal</DialogTitle>
                </DialogHeader>
                <View style={styles.dialogForm}>
                  <View style={styles.formGroup}>
                    <Label>Goal Title *</Label>
                    <Input
                      placeholder="e.g., Master Moonlight Sonata"
                      value={newGoalTitle}
                      onChangeText={setNewGoalTitle}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Label>Category *</Label>
                    <Input
                      placeholder="e.g., Repertoire, Technique, Performance"
                      value={newGoalCategory}
                      onChangeText={setNewGoalCategory}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Label>Target Date *</Label>
                    <Input
                      placeholder="YYYY-MM-DD"
                      value={newGoalDate}
                      onChangeText={setNewGoalDate}
                    />
                  </View>
                  <Button onPress={handleAddGoal} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Create Goal</Text>
                  </Button>
                </View>
              </DialogContent>
            </Dialog>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Goals</Text>
              {goals.map((goal) => (
                <Card key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Badge variant="default" style={styles.goalBadge}>
                        {goal.category}
                      </Badge>
                    </View>
                    <Text style={styles.goalProgress}>{goal.progress}%</Text>
                  </View>
                  <Progress value={goal.progress} style={styles.goalProgressBar} />
                  <View style={styles.goalFooter}>
                    <Text style={styles.goalDate}>
                      Target: {formatDate(goal.targetDate)}
                    </Text>
                    {goal.progress === 100 && (
                      <Badge variant="success">
                        <Ionicons name="checkmark-circle" size={12} color="#059669" />
                        <Text style={styles.completedText}> Completed</Text>
                      </Badge>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          </TabsContent>

          {/* Recordings Tab */}
          <TabsContent value="recordings">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button style={styles.addButton}>
                  <Ionicons name="cloud-upload-outline" size={18} color="white" />
                  <Text style={styles.addButtonText}>Upload Recording</Text>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Practice Recording</DialogTitle>
                </DialogHeader>
                <View style={styles.dialogForm}>
                  <View style={styles.formGroup}>
                    <Label>Recording Title *</Label>
                    <Input placeholder="e.g., Fur Elise - Practice Run" />
                  </View>
                  <View style={styles.formGroup}>
                    <Label>Upload File *</Label>
                    <TouchableOpacity style={styles.uploadArea}>
                      <Ionicons name="cloud-upload-outline" size={32} color="#999" />
                      <Text style={styles.uploadText}>
                        Click to upload or drag and drop
                      </Text>
                      <Text style={styles.uploadSubtext}>
                        MP3, WAV, or MP4 (Max 50MB)
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.formGroup}>
                    <Label>Notes for Teacher (Optional)</Label>
                    <TextInput
                      style={styles.textArea}
                      multiline
                      numberOfLines={4}
                      placeholder="Any specific feedback you're looking for?"
                    />
                  </View>
                  <Button
                    onPress={handleUploadRecording}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Upload Recording</Text>
                  </Button>
                </View>
              </DialogContent>
            </Dialog>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Recordings</Text>
              {recordings.map((recording) => (
                <Card key={recording.id} style={styles.recordingCard}>
                  <View style={styles.recordingRow}>
                    <View style={styles.recordingIcon}>
                      <Ionicons name="play" size={20} color="#FF6A5C" />
                    </View>
                    <View style={styles.recordingInfo}>
                      <Text style={styles.recordingTitle}>{recording.title}</Text>
                      <View style={styles.recordingMeta}>
                        <Text style={styles.recordingMetaText}>
                          {recording.duration}
                        </Text>
                        <Text style={styles.recordingMetaText}>•</Text>
                        <Text style={styles.recordingMetaText}>
                          {formatDate(recording.date)}
                        </Text>
                      </View>
                      {recording.hasTeacherFeedback && (
                        <View style={styles.feedbackBox}>
                          <View style={styles.feedbackHeader}>
                            <Ionicons name="chatbubble-outline" size={16} color="#2563EB" />
                            <Text style={styles.feedbackTitle}>Teacher Feedback</Text>
                          </View>
                          <Text style={styles.feedbackText}>
                            {recording.teacherNotes}
                          </Text>
                        </View>
                      )}
                      {!recording.hasTeacherFeedback && (
                        <Badge variant="warning" style={styles.pendingBadge}>
                          Pending Review
                        </Badge>
                      )}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </TabsContent>
        </Tabs>
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
    paddingHorizontal: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: "#666",
  },
  tabsList: {
    marginBottom: 16,
  },
  progressCard: {
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF6A5C",
  },
  progressBar: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  entryCard: {
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  entryInfo: {
    flex: 1,
  },
  entryFocus: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  entryNotes: {
    fontSize: 14,
    color: "#666",
  },
  entryDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  entryDate: {
    fontSize: 12,
    color: "#666",
  },
  achievementsCard: {
    padding: 16,
    marginBottom: 24,
  },
  achievementsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dialogForm: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  textArea: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 8,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  goalCard: {
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  goalBadge: {
    alignSelf: "flex-start",
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF6A5C",
  },
  goalProgressBar: {
    marginBottom: 8,
  },
  goalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalDate: {
    fontSize: 12,
    color: "#666",
  },
  completedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  recordingCard: {
    padding: 16,
    marginBottom: 12,
  },
  recordingRow: {
    flexDirection: "row",
    gap: 12,
  },
  recordingIcon: {
    backgroundColor: "#FFE0D6",
    padding: 12,
    borderRadius: 10,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  recordingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  recordingMetaText: {
    fontSize: 12,
    color: "#666",
  },
  feedbackBox: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
  },
  feedbackText: {
    fontSize: 12,
    color: "#1E3A8A",
  },
  pendingBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});

