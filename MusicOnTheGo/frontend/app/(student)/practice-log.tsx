import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { api } from "../../lib/api";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface PracticeEntry {
  _id?: string;
  id?: number;
  date: string | Date;
  startTime?: string | Date;
  endTime?: string | Date;
  minutes: number;
  focus: string;
  notes: string;
}

interface Recording {
  _id?: string;
  id?: number;
  date?: string;
  createdAt?: string;
  title: string;
  duration: string;
  hasTeacherFeedback: boolean;
  teacherNotes?: string;
  teacherFeedback?: string;
}


interface Badge {
  emoji: string;
  text: string;
  variant: "default" | "secondary" | "success" | "warning";
}

interface Stats {
  thisWeekMinutes: number;
  weeklyGoal: number;
  weeklyProgress: number;
  streak: number;
  badges?: Badge[];
}

export default function PracticeLogScreen() {
  const router = useRouter();

  const [practiceEntries, setPracticeEntries] = useState<PracticeEntry[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [stats, setStats] = useState<Stats>({
    thisWeekMinutes: 0,
    weeklyGoal: 180,
    weeklyProgress: 0,
    streak: 0,
    badges: [],
  });
  const [loading, setLoading] = useState(true);

  const [minutes, setMinutes] = useState("");
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [weeklyGoalSliderValue, setWeeklyGoalSliderValue] = useState([180]);
  const [recordingTitle, setRecordingTitle] = useState("");
  const [recordingFileUrl, setRecordingFileUrl] = useState("");
  const [recordingDuration, setRecordingDuration] = useState("");
  const [recordingNotes, setRecordingNotes] = useState("");

  // Load data from backend
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load practice sessions
      const sessions = await api("/api/practice/sessions/me", { auth: true });
      const transformedSessions = (Array.isArray(sessions) ? sessions : []).map((s: any) => ({
        _id: s._id,
        date: s.date || s.createdAt,
        startTime: s.startTime || s.date || s.createdAt,
        endTime: s.endTime,
        minutes: s.minutes,
        focus: s.focus,
        notes: s.notes || "",
      }));
      setPracticeEntries(transformedSessions);

      // Goals are no longer displayed, but we still load them for backend calculations

      // Load recordings
      const recordingsData = await api("/api/practice/recordings/me", { auth: true });
      const transformedRecordings = (Array.isArray(recordingsData) ? recordingsData : []).map((r: any) => ({
        _id: r._id,
        date: r.createdAt,
        title: r.title,
        duration: r.duration || "",
        hasTeacherFeedback: r.hasTeacherFeedback || false,
        teacherNotes: r.teacherFeedback || "",
      }));
      setRecordings(transformedRecordings);

      // Load stats
      const statsData = await api("/api/practice/stats/me", { auth: true });
      setStats({
        thisWeekMinutes: statsData?.thisWeekMinutes || 0,
        weeklyGoal: statsData?.weeklyGoal || null,
        weeklyProgress: statsData?.weeklyProgress || 0,
        streak: statsData?.streak || 0,
        badges: statsData?.badges || [],
      });
    } catch (err) {
      console.error("Failed to load practice data", err);
      Alert.alert("Error", "Failed to load practice data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Calculate stats from entries (fallback)
  const totalMinutes = stats.thisWeekMinutes || practiceEntries.reduce((sum, entry) => sum + entry.minutes, 0);
  const weeklyGoal = stats.weeklyGoal || null;
  const weeklyProgress = weeklyGoal && weeklyGoal > 0 
    ? (stats.weeklyProgress || Math.min((totalMinutes / weeklyGoal) * 100, 100))
    : 0;
  const streak = stats.streak || 0;

  const handleAddEntry = async () => {
    if (!minutes || !focus) {
      Alert.alert("Error", "Please fill in required fields");
      return;
    }

    try {
      const newSession = await api("/api/practice/sessions", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          minutes: parseInt(minutes),
          focus,
          notes,
        }),
      });

      setMinutes("");
      setFocus("");
      setNotes("");
      setIsDialogOpen(false);
      Alert.alert("Success", `Logged ${minutes} minutes of practice!`);
      loadData(); // Reload data
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to log practice session");
    }
  };

  const handleAddGoal = async () => {
    const goalMinutes = weeklyGoalSliderValue[0];
    
    if (goalMinutes === 0) {
      Alert.alert("Error", "Please set a weekly goal greater than 0 minutes");
      return;
    }

    try {
      // Update the user's weeklyGoal field
      await api("/api/users/me", {
        method: "PUT",
        auth: true,
        body: JSON.stringify({
          weeklyGoal: goalMinutes,
        }),
      });

      // Reset form
      setWeeklyGoalSliderValue([180]);
      setIsGoalDialogOpen(false);
      
      Alert.alert("Success", "Weekly goal set successfully!");
      loadData(); // Reload data
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to set weekly goal");
    }
  };


  const handleUploadRecording = async () => {
    if (!recordingTitle) {
      Alert.alert("Error", "Please enter a recording title");
      return;
    }

    try {
      await api("/api/practice/recordings", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          title: recordingTitle,
          fileUrl: recordingFileUrl,
          duration: recordingDuration,
          studentNotes: recordingNotes,
        }),
      });

      setRecordingTitle("");
      setRecordingFileUrl("");
      setRecordingDuration("");
      setRecordingNotes("");
      setIsUploadDialogOpen(false);
      Alert.alert("Success", "Recording uploaded! Your teacher will review it soon.");
      loadData(); // Reload data
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to upload recording");
    }
  };

  const formatDate = (dateString: string | Date): string => {
    try {
      const date = typeof dateString === "string" ? new Date(dateString) : dateString;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return String(dateString);
    }
  };

  const formatDateWithDay = (dateString: string | Date): string => {
    try {
      const date = typeof dateString === "string" ? new Date(dateString) : dateString;
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return String(dateString);
    }
  };

  const formatTimeRange = (startTime: string | Date, minutes: number): string => {
    try {
      const start = typeof startTime === "string" ? new Date(startTime) : startTime;
      const end = new Date(start.getTime() + minutes * 60 * 1000);
      
      const startTimeStr = start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const endTimeStr = end.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      
      return `${startTimeStr} - ${endTimeStr}`;
    } catch {
      return "";
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6A5C" />
            <Text style={styles.loadingText}>Loading practice data...</Text>
          </View>
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="time-outline" size={16} color="#FF6A5C" />
                  <Text style={styles.statLabel}>This Week</Text>
                </View>
                <Text style={styles.statValue}>{totalMinutes} min</Text>
                <Text style={styles.statSubtext}>
                  Goal: {weeklyGoal && weeklyGoal > 0 ? `${weeklyGoal} min` : "Not set"}
                </Text>
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
            <TabsTrigger value="history">History</TabsTrigger>
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
                <TouchableOpacity
                  onPress={() => {
                    setWeeklyGoalSliderValue([weeklyGoal || 180]);
                    setIsGoalDialogOpen(true);
                  }}
                >
                  <Ionicons name="create-outline" size={18} color="#FF6A5C" />
                </TouchableOpacity>
              </View>
              <View style={styles.progressHeader}>
                <View style={styles.progressTitleRow}>
                  <Text style={styles.progressPercent}>
                    {weeklyGoal && weeklyGoal > 0 ? `${Math.round(weeklyProgress)}%` : "—"}
                  </Text>
                </View>
                <Text style={styles.goalText}>
                  {weeklyGoal && weeklyGoal > 0 ? `${weeklyGoal} min/week` : "Not set"}
                </Text>
              </View>
              {weeklyGoal && weeklyGoal > 0 ? (
                <>
                  <Progress value={weeklyProgress} style={styles.progressBar} />
                  <Text style={styles.progressText}>
                    {weeklyGoal - totalMinutes > 0
                      ? `${weeklyGoal - totalMinutes} minutes to go!`
                      : "Goal achieved! 🎉"}
                  </Text>
                </>
              ) : (
                <Text style={styles.progressText}>
                  Set a weekly goal to track your progress!
                </Text>
              )}
            </Card>

            {/* Add Weekly Goal Button */}
            <Button
              style={styles.addButton}
              onPress={() => {
                setWeeklyGoalSliderValue([stats.weeklyGoal || 180]);
                setIsGoalDialogOpen(true);
              }}
            >
              <Ionicons name="add" size={18} color="white" />
              <Text style={styles.addButtonText}>Add weekly goal</Text>
            </Button>

            {/* Start Practice Timer Button */}
            <Button
              style={styles.addButton}
              onPress={() => {
                // Check if weekly goal is set before navigating
                if (!stats.weeklyGoal || stats.weeklyGoal === 0) {
                  // Open the weekly goal dialog
                  setWeeklyGoalSliderValue([stats.weeklyGoal || 180]);
                  setIsGoalDialogOpen(true);
                } else {
                  router.push("/(student)/practice-timer");
                }
              }}
            >
              <Ionicons name="play-circle" size={20} color="white" />
              <Text style={styles.addButtonText}>Start Practice Timer</Text>
            </Button>

            {/* Manual Entry Option (Optional) */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <TouchableOpacity
                  style={styles.manualEntryButton}
                  onPress={() => setIsDialogOpen(true)}
                >
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.manualEntryText}>Or log manually</Text>
                </TouchableOpacity>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Practice Session</DialogTitle>
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
              {practiceEntries.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons name="calendar-outline" size={48} color="#999" />
                  <Text style={styles.emptyText}>No practice sessions yet</Text>
                  <Text style={styles.emptySubtext}>
                    Start logging your practice to track your progress!
                  </Text>
                </Card>
              ) : (
                <>
                  {practiceEntries.slice(0, 5).map((entry) => (
                    <Card key={entry._id || entry.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <View style={styles.entryInfo}>
                        <Text style={styles.entryFocus}>{entry.focus}</Text>
                        {entry.notes && (
                          <Text style={styles.entryNotes}>{entry.notes}</Text>
                        )}
                      </View>
                      <Badge variant="default">{entry.minutes} min</Badge>
                    </View>
                    <View style={styles.entryDateRow}>
                      <Ionicons name="calendar-outline" size={14} color="#666" />
                      <Text style={styles.entryDate}>
                        {formatDateWithDay(entry.date)}
                      </Text>
                    </View>
                    {entry.startTime && (
                      <View style={styles.entryTimeRow}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text style={styles.entryTime}>
                          {formatTimeRange(entry.startTime, entry.minutes)}
                        </Text>
                      </View>
                    )}
                  </Card>
                  ))}
                  {/* Total minutes for recent sessions */}
                  <Card style={styles.totalCard}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Badge variant="success">
                        {practiceEntries.slice(0, 5).reduce((sum, entry) => sum + entry.minutes, 0)} min
                      </Badge>
                    </View>
                  </Card>
                </>
              )}
            </View>

            {/* Achievements */}
            <Card style={styles.achievementsCard}>
              <View style={styles.achievementsHeader}>
                <Ionicons name="trophy-outline" size={20} color="#FFB800" />
                <Text style={styles.achievementsTitle}>Badges Earned</Text>
              </View>
              {stats.badges && stats.badges.length > 0 ? (
                <View style={styles.badgesRow}>
                  {stats.badges.map((badge, index) => (
                    <Badge key={index} variant={badge.variant}>
                      {badge.emoji} {badge.text}
                    </Badge>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyBadgesContainer}>
                  <Text style={styles.emptyBadgesText}>
                    Keep practicing to earn badges! 🎯
                  </Text>
                </View>
              )}
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Practice History</Text>
              {practiceEntries.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons name="calendar-outline" size={48} color="#999" />
                  <Text style={styles.emptyText}>No practice sessions yet</Text>
                  <Text style={styles.emptySubtext}>
                    Start logging your practice to track your progress!
                  </Text>
                </Card>
              ) : (
                (() => {
                  // Group entries by month
                  const groupedByMonth: { [key: string]: PracticeEntry[] } = {};
                  practiceEntries.forEach((entry) => {
                    const date = typeof entry.date === "string" ? new Date(entry.date) : entry.date;
                    const monthKey = date.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    });
                    if (!groupedByMonth[monthKey]) {
                      groupedByMonth[monthKey] = [];
                    }
                    groupedByMonth[monthKey].push(entry);
                  });

                  // Sort months (newest first)
                  const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
                    const dateA = new Date(a + " 1");
                    const dateB = new Date(b + " 1");
                    return dateB.getTime() - dateA.getTime();
                  });

                  return sortedMonths.map((month) => (
                    <View key={month} style={styles.monthSection}>
                      <Text style={styles.monthTitle}>{month}</Text>
                      {groupedByMonth[month]
                        .sort((a, b) => {
                          const dateA = typeof a.date === "string" ? new Date(a.date) : a.date;
                          const dateB = typeof b.date === "string" ? new Date(b.date) : b.date;
                          return dateB.getTime() - dateA.getTime();
                        })
                        .map((entry) => (
                          <Card key={entry._id || entry.id} style={styles.entryCard}>
                            <View style={styles.entryHeader}>
                              <View style={styles.entryInfo}>
                                <Text style={styles.entryFocus}>{entry.focus}</Text>
                                {entry.notes && (
                                  <Text style={styles.entryNotes}>{entry.notes}</Text>
                                )}
                              </View>
                              <Badge variant="default">{entry.minutes} min</Badge>
                            </View>
                            <View style={styles.entryDateRow}>
                              <Ionicons name="calendar-outline" size={14} color="#666" />
                              <Text style={styles.entryDate}>
                                {formatDateWithDay(entry.date)}
                              </Text>
                            </View>
                            {entry.startTime && (
                              <View style={styles.entryTimeRow}>
                                <Ionicons name="time-outline" size={14} color="#666" />
                                <Text style={styles.entryTime}>
                                  {formatTimeRange(entry.startTime, entry.minutes)}
                                </Text>
                              </View>
                            )}
                          </Card>
                        ))}
                    </View>
                  ));
                })()
              )}
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
                    <Input
                      placeholder="e.g., Fur Elise - Practice Run"
                      value={recordingTitle}
                      onChangeText={setRecordingTitle}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Label>File URL (Optional)</Label>
                    <Input
                      placeholder="Paste file URL or leave empty for now"
                      value={recordingFileUrl}
                      onChangeText={setRecordingFileUrl}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Label>Duration (Optional)</Label>
                    <Input
                      placeholder="e.g., 2:45"
                      value={recordingDuration}
                      onChangeText={setRecordingDuration}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Label>Notes for Teacher (Optional)</Label>
                    <TextInput
                      style={styles.textArea}
                      multiline
                      numberOfLines={4}
                      placeholder="Any specific feedback you're looking for?"
                      value={recordingNotes}
                      onChangeText={setRecordingNotes}
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
              {recordings.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons name="musical-notes-outline" size={48} color="#999" />
                  <Text style={styles.emptyText}>No recordings yet</Text>
                  <Text style={styles.emptySubtext}>
                    Upload recordings to get feedback from your teacher!
                  </Text>
                </Card>
              ) : (
                recordings.map((recording) => (
                  <Card key={recording._id || recording.id} style={styles.recordingCard}>
                  <View style={styles.recordingRow}>
                    <View style={styles.recordingIcon}>
                      <Ionicons name="play" size={20} color="#FF6A5C" />
                    </View>
                    <View style={styles.recordingInfo}>
                      <Text style={styles.recordingTitle}>{recording.title}</Text>
                      <View style={styles.recordingMeta}>
                        {recording.duration && (
                          <>
                            <Text style={styles.recordingMetaText}>
                              {recording.duration}
                            </Text>
                            <Text style={styles.recordingMetaText}>•</Text>
                          </>
                        )}
                        <Text style={styles.recordingMetaText}>
                          {formatDate(recording.date || recording.createdAt || new Date())}
                        </Text>
                      </View>
                      {recording.hasTeacherFeedback && (
                        <View style={styles.feedbackBox}>
                          <View style={styles.feedbackHeader}>
                            <Ionicons name="chatbubble-outline" size={16} color="#2563EB" />
                            <Text style={styles.feedbackTitle}>Teacher Feedback</Text>
                          </View>
                          <Text style={styles.feedbackText}>
                            {recording.teacherNotes || recording.teacherFeedback}
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
                ))
              )}
            </View>
          </TabsContent>
        </Tabs>

        {/* Weekly Goal Dialog - Outside tabs so it's always rendered */}
        <Dialog 
          open={isGoalDialogOpen} 
          onOpenChange={(open) => {
            setIsGoalDialogOpen(open);
            // Initialize slider with current weekly goal when dialog opens
            if (open && stats.weeklyGoal) {
              setWeeklyGoalSliderValue([stats.weeklyGoal]);
            } else if (open && !stats.weeklyGoal) {
              setWeeklyGoalSliderValue([180]); // Default to 180 if not set
            }
            // Reset form when closing
            if (!open) {
              setWeeklyGoalSliderValue([180]);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Weekly Goal</DialogTitle>
            </DialogHeader>
            <View style={styles.dialogForm}>
              <View style={styles.formGroup}>
                <Label>How many minutes do you want to practice this week?</Label>
                <View style={styles.sliderContainer}>
                  <Slider
                    value={weeklyGoalSliderValue}
                    onValueChange={setWeeklyGoalSliderValue}
                    min={0}
                    max={300}
                    step={5}
                    style={styles.slider}
                  />
                  <Text style={styles.sliderValue}>
                    {weeklyGoalSliderValue[0]} min
                  </Text>
                </View>
              </View>
              <Button onPress={handleAddGoal} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Set Goal</Text>
              </Button>
            </View>
          </DialogContent>
        </Dialog>
      </>
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
    marginBottom: 12,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  manualEntryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginBottom: 16,
  },
  manualEntryText: {
    color: "#666",
    fontSize: 14,
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
  entryTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  entryTime: {
    fontSize: 12,
    color: "#666",
  },
  totalCard: {
    padding: 16,
    marginTop: 8,
    backgroundColor: "#FFF5F3",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  monthSection: {
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  goalText: {
    fontSize: 14,
    color: "#666",
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
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
  emptyBadgesContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyBadgesText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  emptyCard: {
    padding: 32,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
  sliderContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  slider: {
    marginBottom: 12,
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF6A5C",
    textAlign: "center",
    marginTop: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});

