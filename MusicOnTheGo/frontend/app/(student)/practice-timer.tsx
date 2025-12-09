import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  AppState,
  AppStateStatus,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TIMER_STORAGE_KEY = "@practice_timer_state";

interface TimerState {
  elapsedSeconds: number;
  startTime: number | null;
  isRunning: boolean;
  focus: string;
}

export default function PracticeTimerScreen() {
  const router = useRouter();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [baseElapsed, setBaseElapsed] = useState(0); // Elapsed time when paused
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [focus, setFocus] = useState("");
  const [showFocusInput, setShowFocusInput] = useState(true);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null);
  const [checkingGoal, setCheckingGoal] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // Format time display
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Check weekly goal on mount
  useEffect(() => {
    const checkWeeklyGoal = async () => {
      try {
        const stats = await api("/api/practice/stats/me", { auth: true });
        setWeeklyGoal(stats?.weeklyGoal || null);
      } catch (err) {
        console.error("Failed to load weekly goal", err);
      } finally {
        setCheckingGoal(false);
      }
    };
    checkWeeklyGoal();
  }, []);

  // Load timer state from storage
  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const saved = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
        if (saved) {
          const state: TimerState = JSON.parse(saved);
          if (state.isRunning && state.startTime) {
            // Calculate elapsed time since start (handles app being in background)
            const now = Date.now();
            const elapsed = Math.floor((now - state.startTime) / 1000);
            setElapsedSeconds(elapsed);
            setBaseElapsed(0);
            setStartTime(state.startTime);
            setIsRunning(true);
            setIsPaused(false);
            setFocus(state.focus || "");
            setShowFocusInput(false);
            startTimer(state.startTime, 0); // Start from 0, calculate from timestamp
          } else if (state.elapsedSeconds > 0) {
            // Timer was paused or stopped, restore state
            setElapsedSeconds(state.elapsedSeconds);
            setBaseElapsed(state.elapsedSeconds); // Set baseElapsed to current elapsed time
            setStartTime(null);
            setSessionStartTime(null);
            setIsRunning(false);
            setIsPaused(false); // Could be paused or stopped, but we'll show Resume button
            setFocus(state.focus || "");
            setShowFocusInput(false);
          } else {
            setElapsedSeconds(0);
            setBaseElapsed(0);
            setFocus(state.focus || "");
          }
        }
      } catch (err) {
        console.error("Failed to load timer state", err);
      }
    };

    loadTimerState();
  }, []);

  // Save timer state to storage
  const saveTimerState = async (state: Partial<TimerState>) => {
    try {
      const currentState: TimerState = {
        elapsedSeconds,
        startTime,
        isRunning,
        focus,
        ...state,
      };
      await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(currentState));
    } catch (err) {
      console.error("Failed to save timer state", err);
    }
  };

  // Handle app state changes - recalculate timer when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active" &&
        isRunning &&
        startTime
      ) {
        // App came to foreground, recalculate elapsed time from start timestamp
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedSeconds(elapsed);
        // Restart timer with current elapsed time
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        startTimer(startTime, 0);
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isRunning, startTime, elapsedSeconds]);

  // Timer interval - calculates from start timestamp (works even if app is in background)
  const startTimer = (start: number, baseElapsed: number = 0) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Update immediately
    const now = Date.now();
    const elapsed = baseElapsed + Math.floor((now - start) / 1000);
    setElapsedSeconds(elapsed);

    // Update every second
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = baseElapsed + Math.floor((now - start) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start timer
  const handleStart = () => {
    if (!focus.trim()) {
      Alert.alert("Focus Required", "Please enter what you'll be practicing");
      return;
    }

    // Check if weekly goal is set
    if (!weeklyGoal || weeklyGoal === 0) {
      Alert.alert(
        "Weekly Goal Required",
        "Please set your weekly practice goal before starting the timer. You can set it in the Progress tab.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go to Settings",
            onPress: () => {
              router.back();
              // Navigate to practice-log where they can set the goal
              setTimeout(() => {
                router.push("/(student)/practice-log");
              }, 100);
            },
          },
        ]
      );
      return;
    }

    const now = Date.now();
    setStartTime(now);
    setSessionStartTime(new Date()); // Track when practice session started
    setBaseElapsed(0);
    setIsRunning(true);
    setIsPaused(false);
    setShowFocusInput(false);
    startTimer(now, 0);
    saveTimerState({ startTime: now, isRunning: true, elapsedSeconds: 0 });
  };

  // Pause timer
  const handlePause = () => {
    stopTimer();
    // Save current elapsed time as base
    setBaseElapsed(elapsedSeconds);
    setIsRunning(false);
    setIsPaused(true);
    saveTimerState({ isRunning: false, elapsedSeconds });
  };

  // Resume timer - continue from where we left off
  const handleResume = () => {
    const now = Date.now();
    // Use the maximum of baseElapsed and elapsedSeconds to ensure we don't go backwards
    // This handles cases where baseElapsed might not be set correctly
    const resumeFrom = Math.max(baseElapsed, elapsedSeconds);
    setStartTime(now);
    setBaseElapsed(resumeFrom);
    setIsRunning(true);
    setIsPaused(false);
    // Continue from base elapsed time
    startTimer(now, resumeFrom);
    saveTimerState({ startTime: now, isRunning: true, elapsedSeconds: resumeFrom });
  };

  // Stop timer and show notes input
  const handleStop = () => {
    stopTimer();
    // Save current elapsed time as base for potential resume
    setBaseElapsed(elapsedSeconds);
    setIsRunning(false);
    setIsPaused(false);
    setShowNotesInput(true);
    saveTimerState({ isRunning: false, elapsedSeconds });
  };

  // Cancel timer
  const handleCancel = () => {
    Alert.alert(
      "Cancel Practice Session?",
      "Are you sure you want to cancel? Your progress will be lost.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            stopTimer();
            setElapsedSeconds(0);
            setStartTime(null);
            setBaseElapsed(0);
            setSessionStartTime(null);
            setIsRunning(false);
            setIsPaused(false);
            setFocus("");
            setNotes("");
            setShowFocusInput(true);
            setShowNotesInput(false);
            await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
            router.back();
          },
        },
      ]
    );
  };

  // Save practice session
  const handleSave = async () => {
    if (elapsedSeconds < 60) {
      Alert.alert("Too Short", "Practice session must be at least 1 minute");
      return;
    }

    try {
      setIsSaving(true);
      const minutes = Math.floor(elapsedSeconds / 60);
      const endTime = new Date();
      
      await api("/api/practice/sessions", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          minutes,
          focus,
          notes: notes.trim() || "",
          startTime: sessionStartTime || new Date(),
          endTime: endTime,
        }),
      });

      // Clear timer state
      await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
      
      Alert.alert(
        "Practice Session Saved!",
        `Great job! You practiced for ${formatTime(elapsedSeconds)}`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save practice session");
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  const minutes = Math.floor(elapsedSeconds / 60);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FF6A5C", "#FF9076"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Timer</Text>
        <Text style={styles.headerSubtitle}>
          {showFocusInput
            ? "Set your focus and start practicing"
            : isRunning
            ? "Keep practicing!"
            : "Practice session paused"}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Loading State */}
        {checkingGoal && (
          <Card style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#FF6A5C" />
            <Text style={styles.loadingText}>Loading...</Text>
          </Card>
        )}

        {/* Focus Input (Before Starting) */}
        {!checkingGoal && showFocusInput && (
          <Card style={styles.setupCard}>
            <View style={styles.setupHeader}>
              <Ionicons name="musical-notes" size={24} color="#FF6A5C" />
              <Text style={styles.setupTitle}>What will you practice today?</Text>
            </View>
            <View style={styles.inputGroup}>
              <Label>Focus Area *</Label>
              <Input
                placeholder="e.g., Scales, Song Practice, Technique, Sight Reading"
                value={focus}
                onChangeText={setFocus}
                style={styles.focusInput}
              />
            </View>
            <Button onPress={handleStart} style={styles.startButton}>
              <Ionicons name="play" size={20} color="white" />
              <Text style={styles.startButtonText}>Start Practice</Text>
            </Button>
          </Card>
        )}

        {/* Timer Display (During Practice) */}
        {!checkingGoal && !showFocusInput && !showNotesInput && (
          <>
            <Card style={styles.timerCard}>
              <View style={styles.timerDisplay}>
                <Text style={styles.timerTime}>{formatTime(elapsedSeconds)}</Text>
                <Text style={styles.timerLabel}>
                  {isRunning ? "Practicing..." : "Paused"}
                </Text>
                <View style={styles.focusBadge}>
                  <Ionicons name="musical-notes" size={16} color="#FF6A5C" />
                  <Text style={styles.focusBadgeText}>{focus}</Text>
                </View>
              </View>
            </Card>

            <View style={styles.controls}>
              {isRunning ? (
                <Button
                  onPress={handlePause}
                  variant="secondary"
                  style={styles.controlButton}
                >
                  <Ionicons name="pause" size={24} color="#333" />
                  <Text style={[styles.controlButtonText, styles.controlButtonTextSecondary]}>
                    Pause
                  </Text>
                </Button>
              ) : elapsedSeconds > 0 ? (
                // If there's elapsed time, show Resume (even if paused or stopped)
                <Button onPress={handleResume} style={styles.controlButton}>
                  <Ionicons name="play" size={24} color="white" />
                  <Text style={styles.controlButtonText}>Resume</Text>
                </Button>
              ) : (
                // If no elapsed time, show Start
                <Button onPress={handleStart} style={styles.controlButton}>
                  <Ionicons name="play" size={24} color="white" />
                  <Text style={styles.controlButtonText}>Start</Text>
                </Button>
              )}

              <Button
                onPress={handleStop}
                variant="outline"
                style={[styles.controlButton, styles.stopButton]}
              >
                <Ionicons name="stop" size={24} color="#FF6A5C" />
                <Text style={styles.stopButtonText}>Finish</Text>
              </Button>
            </View>

            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="information-circle-outline" size={20} color="#666" />
                <Text style={styles.infoText}>
                  You can minimize the app and the timer will continue running
                </Text>
              </View>
            </Card>
          </>
        )}

        {/* Notes Input (After Stopping) */}
        {!checkingGoal && showNotesInput && (
          <Card style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#059669" />
              <Text style={styles.notesTitle}>Great Practice Session!</Text>
            </View>
            <View style={styles.sessionSummary}>
              <Text style={styles.summaryLabel}>Practice Time</Text>
              <Text style={styles.summaryValue}>{formatTime(elapsedSeconds)}</Text>
            </View>
            <View style={styles.sessionSummary}>
              <Text style={styles.summaryLabel}>Focus Area</Text>
              <Text style={styles.summaryValue}>{focus}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Label>What did you work on? (Optional)</Label>
              <Textarea
                placeholder="What did you practice? What was challenging? What went well?"
                value={notes}
                onChangeText={setNotes}
                style={styles.notesInput}
                numberOfLines={6}
              />
            </View>

            <View style={styles.saveActions}>
              <Button
                onPress={handleSave}
                disabled={isSaving}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Saving..." : "Save Practice Session"}
                </Text>
              </Button>
              <TouchableOpacity
                onPress={() => {
                  setShowNotesInput(false);
                  // Ensure baseElapsed is set to current elapsed time for resume
                  setBaseElapsed(elapsedSeconds);
                  // Don't reset focus input - just go back to timer display
                  // Timer state is preserved (elapsedSeconds, startTime, etc.)
                  setNotes("");
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Back to Timer</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </View>
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
  backText: {
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
  setupCard: {
    padding: 24,
    marginTop: 20,
  },
  setupHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 12,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  focusInput: {
    marginTop: 8,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  timerCard: {
    padding: 32,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  timerDisplay: {
    alignItems: "center",
  },
  timerTime: {
    fontSize: 72,
    fontWeight: "700",
    color: "#333",
    fontVariant: ["tabular-nums"],
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 18,
    color: "#666",
    marginBottom: 16,
  },
  focusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFE0D6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  focusBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6A5C",
  },
  controls: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
  },
  controlButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  controlButtonTextSecondary: {
    color: "#333",
  },
  stopButton: {
    borderColor: "#FF6A5C",
  },
  stopButtonText: {
    color: "#FF6A5C",
    fontSize: 18,
    fontWeight: "600",
  },
  infoCard: {
    padding: 16,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  notesCard: {
    padding: 24,
    marginTop: 20,
  },
  notesHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginTop: 12,
  },
  sessionSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  notesInput: {
    marginTop: 8,
    minHeight: 120,
  },
  saveActions: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    paddingVertical: 16,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
  loadingCard: {
    padding: 32,
    alignItems: "center",
    marginTop: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});

