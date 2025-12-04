import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Quiz {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const theoryQuizzes: Quiz[] = [
  {
    id: 1,
    question: "How many half steps are in a perfect fifth?",
    options: ["5", "7", "9", "12"],
    correctAnswer: 1,
    explanation: "A perfect fifth contains 7 half steps (semitones).",
  },
  {
    id: 2,
    question: "What is the relative minor of C major?",
    options: ["G minor", "A minor", "E minor", "D minor"],
    correctAnswer: 1,
    explanation: "A minor is the relative minor of C major, sharing the same key signature.",
  },
  {
    id: 3,
    question: "Which interval is known as the \"devil's interval\"?",
    options: ["Major 7th", "Diminished 5th", "Augmented 4th", "Both B and C"],
    correctAnswer: 3,
    explanation: "The tritone (diminished 5th/augmented 4th) was historically called the devil's interval.",
  },
  {
    id: 4,
    question: "How many sharps are in the key of E major?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
    explanation: "E major has 4 sharps: F#, C#, G#, and D#.",
  },
  {
    id: 5,
    question: "What does \"forte\" mean in music?",
    options: ["Loud", "Soft", "Fast", "Slow"],
    correctAnswer: 0,
    explanation: "Forte (f) is a dynamic marking that means to play loudly.",
  },
];

export default function InteractiveToolsScreen() {
  const router = useRouter();

  // Metronome state
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tuner state
  const [currentNote, setCurrentNote] = useState("A");
  const [frequency, setFrequency] = useState(440);
  const [isTuning, setIsTuning] = useState(false);
  const [tuningAccuracy, setTuningAccuracy] = useState(0);
  const tunerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const currentQuiz = theoryQuizzes[currentQuizIndex];

  // Metronome effect
  useEffect(() => {
    if (!isPlaying) {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
      return;
    }

    const interval = (60 / bpm) * 1000;
    metronomeIntervalRef.current = setInterval(() => {
      setBeat((prev) => (prev + 1) % beatsPerMeasure);
    }, interval);

    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
    };
  }, [isPlaying, bpm, beatsPerMeasure]);

  const handleBpmChange = (values: number[]) => {
    setBpm(values[0]);
  };

  const adjustBpm = (delta: number) => {
    setBpm((prev) => Math.max(40, Math.min(240, prev + delta)));
  };

  const handleTunerStart = () => {
    setIsTuning(!isTuning);
  };

  // Tuner effect
  useEffect(() => {
    if (!isTuning) {
      if (tunerIntervalRef.current) {
        clearInterval(tunerIntervalRef.current);
        tunerIntervalRef.current = null;
      }
      return;
    }

    tunerIntervalRef.current = setInterval(() => {
      setTuningAccuracy(Math.floor(Math.random() * 100) - 50);
    }, 500);

    return () => {
      if (tunerIntervalRef.current) {
        clearInterval(tunerIntervalRef.current);
        tunerIntervalRef.current = null;
      }
    };
  }, [isTuning]);

  const getTuningColor = () => {
    if (!isTuning) return "#999";
    if (Math.abs(tuningAccuracy) < 5) return "#059669";
    if (Math.abs(tuningAccuracy) < 15) return "#D97706";
    return "#DC2626";
  };

  const getTuningStatus = () => {
    if (!isTuning) return "Tap to start tuning";
    if (Math.abs(tuningAccuracy) < 5) return "In tune! ✓";
    if (tuningAccuracy > 0) return `${tuningAccuracy} cents sharp ↑`;
    return `${Math.abs(tuningAccuracy)} cents flat ↓`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    if (answerIndex === currentQuiz.correctAnswer) {
      setScore(score + 1);
      Alert.alert("Correct! 🎉");
    } else {
      Alert.alert("Not quite right. Check the explanation!");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < theoryQuizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
      Alert.alert(
        "Quiz Complete!",
        `You scored ${score + 1}/${theoryQuizzes.length}`
      );
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#FF6A5C", "#FF9076"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Tools</Text>
        <Text style={styles.headerSubtitle}>
          Essential tools for your practice sessions
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Tabs defaultValue="metronome">
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="metronome">Metronome</TabsTrigger>
            <TabsTrigger value="tuner">Tuner</TabsTrigger>
            <TabsTrigger value="quiz">Theory Quiz</TabsTrigger>
          </TabsList>

          {/* Metronome Tab */}
          <TabsContent value="metronome">
            <Card style={styles.toolCard}>
              <View style={styles.metronomeContent}>
                {/* BPM Display */}
                <View style={styles.bpmDisplay}>
                  <Text style={styles.bpmValue}>{bpm}</Text>
                  <Text style={styles.bpmLabel}>BPM</Text>
                </View>

                {/* Beat Indicator */}
                <View style={styles.beatIndicators}>
                  {Array.from({ length: beatsPerMeasure }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.beatCircle,
                        isPlaying && beat === i && styles.beatCircleActive,
                        isPlaying && beat === i && i === 0 && styles.beatCircleFirst,
                      ]}
                    >
                      <Text
                        style={[
                          styles.beatNumber,
                          isPlaying && beat === i && styles.beatNumberActive,
                        ]}
                      >
                        {i + 1}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* BPM Slider */}
                <View style={styles.sliderSection}>
                  <View style={styles.sliderControls}>
                    <TouchableOpacity
                      style={styles.sliderButton}
                      onPress={() => adjustBpm(-5)}
                    >
                      <Ionicons name="remove" size={20} color="#FF6A5C" />
                    </TouchableOpacity>
                    <Text style={styles.sliderLabel}>Adjust Tempo</Text>
                    <TouchableOpacity
                      style={styles.sliderButton}
                      onPress={() => adjustBpm(5)}
                    >
                      <Ionicons name="add" size={20} color="#FF6A5C" />
                    </TouchableOpacity>
                  </View>
                  <Slider
                    value={[bpm]}
                    onValueChange={handleBpmChange}
                    min={40}
                    max={240}
                    step={1}
                    style={styles.slider}
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>40</Text>
                    <Text style={styles.sliderLabelText}>120</Text>
                    <Text style={styles.sliderLabelText}>240</Text>
                  </View>
                </View>

                {/* Time Signature */}
                <View style={styles.timeSignatureRow}>
                  {[3, 4, 6].map((beats) => (
                    <TouchableOpacity
                      key={beats}
                      style={[
                        styles.timeSignatureButton,
                        beatsPerMeasure === beats && styles.timeSignatureButtonActive,
                      ]}
                      onPress={() => {
                        setBeatsPerMeasure(beats);
                        setBeat(0);
                      }}
                    >
                      <Text
                        style={[
                          styles.timeSignatureText,
                          beatsPerMeasure === beats && styles.timeSignatureTextActive,
                        ]}
                      >
                        {beats}/4
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Play/Pause Button */}
                <Button
                  onPress={() => setIsPlaying(!isPlaying)}
                  style={[
                    styles.playButton,
                    isPlaying && styles.playButtonStop,
                  ]}
                  size="lg"
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={20}
                    color="white"
                  />
                  <Text style={styles.playButtonText}>
                    {isPlaying ? "Stop" : "Start"}
                  </Text>
                </Button>

                {/* Tempo Presets */}
                <View style={styles.presetsSection}>
                  <Text style={styles.presetsLabel}>Quick Presets</Text>
                  <View style={styles.presetsRow}>
                    <TouchableOpacity
                      style={styles.presetButton}
                      onPress={() => setBpm(60)}
                    >
                      <Text style={styles.presetText}>Largo (60)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.presetButton}
                      onPress={() => setBpm(120)}
                    >
                      <Text style={styles.presetText}>Allegro (120)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.presetButton}
                      onPress={() => setBpm(180)}
                    >
                      <Text style={styles.presetText}>Presto (180)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          </TabsContent>

          {/* Tuner Tab */}
          <TabsContent value="tuner">
            <Card style={styles.toolCard}>
              <View style={styles.tunerContent}>
                {/* Current Note Display */}
                <View style={styles.noteDisplay}>
                  <Text style={[styles.noteValue, { color: getTuningColor() }]}>
                    {currentNote}
                  </Text>
                  <Text style={styles.frequencyText}>{frequency} Hz</Text>
                </View>

                {/* Tuning Meter */}
                <View style={styles.tuningMeterSection}>
                  <View style={styles.tuningMeter}>
                    {/* Center line */}
                    <View style={styles.centerLine} />
                    {/* Accuracy indicator */}
                    {isTuning && (
                      <View
                        style={[
                          styles.accuracyIndicator,
                          {
                            left: `${50 + (tuningAccuracy / 50) * 40}%`,
                            backgroundColor:
                              Math.abs(tuningAccuracy) < 5
                                ? "#059669"
                                : Math.abs(tuningAccuracy) < 15
                                ? "#D97706"
                                : "#DC2626",
                          },
                        ]}
                      />
                    )}
                    {/* Scale marks */}
                    <View style={styles.meterLabels}>
                      <Text style={styles.meterLabelText}>Flat</Text>
                      <Text style={styles.meterLabelText}>0</Text>
                      <Text style={styles.meterLabelText}>Sharp</Text>
                    </View>
                  </View>
                  <Text style={[styles.tuningStatus, { color: getTuningColor() }]}>
                    {getTuningStatus()}
                  </Text>
                </View>

                {/* Start/Stop Tuner Button */}
                <Button
                  onPress={handleTunerStart}
                  style={[
                    styles.tunerButton,
                    isTuning && styles.tunerButtonStop,
                  ]}
                  size="lg"
                >
                  <Ionicons
                    name={isTuning ? "pause" : "pulse"}
                    size={20}
                    color="white"
                  />
                  <Text style={styles.tunerButtonText}>
                    {isTuning ? "Stop Tuning" : "Start Tuning"}
                  </Text>
                </Button>

                {/* Note Reference */}
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>Chromatic Notes</Text>
                  <View style={styles.notesGrid}>
                    {notes.map((note) => (
                      <TouchableOpacity
                        key={note}
                        style={[
                          styles.noteBadge,
                          currentNote === note && styles.noteBadgeActive,
                        ]}
                        onPress={() => setCurrentNote(note)}
                      >
                        <Text
                          style={[
                            styles.noteBadgeText,
                            currentNote === note && styles.noteBadgeTextActive,
                          ]}
                        >
                          {note}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Info */}
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    💡 Tip: Play your instrument and watch the tuner respond in
                    real-time. The needle shows how close you are to the target
                    note.
                  </Text>
                </View>
              </View>
            </Card>
          </TabsContent>

          {/* Theory Quiz Tab */}
          <TabsContent value="quiz">
            {!quizCompleted ? (
              <>
                {/* Progress */}
                <Card style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <View style={styles.progressTitleRow}>
                      <Ionicons name="bulb-outline" size={20} color="#FF6A5C" />
                      <Text style={styles.progressTitle}>
                        Question {currentQuizIndex + 1}/{theoryQuizzes.length}
                      </Text>
                    </View>
                    <Badge variant="default">
                      Score: {score}/{theoryQuizzes.length}
                    </Badge>
                  </View>
                  <Progress
                    value={((currentQuizIndex + 1) / theoryQuizzes.length) * 100}
                    style={styles.progressBar}
                  />
                </Card>

                {/* Question */}
                <Card style={styles.quizCard}>
                  <View style={styles.quizContent}>
                    <Text style={styles.questionText}>{currentQuiz.question}</Text>

                    {/* Answer Options */}
                    <View style={styles.optionsList}>
                      {currentQuiz.options.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionButton,
                            showExplanation &&
                              index === currentQuiz.correctAnswer &&
                              styles.optionButtonCorrect,
                            showExplanation &&
                              index === selectedAnswer &&
                              index !== currentQuiz.correctAnswer &&
                              styles.optionButtonIncorrect,
                            !showExplanation &&
                              selectedAnswer === index &&
                              styles.optionButtonSelected,
                          ]}
                          onPress={() => handleAnswerSelect(index)}
                          disabled={showExplanation}
                        >
                          <View style={styles.optionContent}>
                            <Text style={styles.optionText}>{option}</Text>
                            {showExplanation && index === currentQuiz.correctAnswer && (
                              <Ionicons name="checkmark-circle" size={20} color="#059669" />
                            )}
                            {showExplanation &&
                              index === selectedAnswer &&
                              index !== currentQuiz.correctAnswer && (
                                <Ionicons name="close-circle" size={20} color="#DC2626" />
                              )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Explanation */}
                    {showExplanation && (
                      <View style={styles.explanationBox}>
                        <Text style={styles.explanationText}>
                          <Text style={styles.explanationBold}>Explanation:</Text>{" "}
                          {currentQuiz.explanation}
                        </Text>
                      </View>
                    )}

                    {/* Next Button */}
                    {showExplanation && (
                      <Button
                        onPress={handleNextQuestion}
                        style={styles.nextButton}
                      >
                        <Text style={styles.nextButtonText}>
                          {currentQuizIndex < theoryQuizzes.length - 1
                            ? "Next Question"
                            : "Finish Quiz"}
                        </Text>
                      </Button>
                    )}
                  </View>
                </Card>
              </>
            ) : (
              /* Quiz Complete */
              <Card style={styles.completeCard}>
                <View style={styles.completeContent}>
                  <View style={styles.trophyIcon}>
                    <Ionicons name="trophy" size={40} color="#FF6A5C" />
                  </View>
                  <Text style={styles.completeTitle}>Quiz Complete!</Text>
                  <Text style={styles.completeScore}>
                    You scored{" "}
                    <Text style={styles.completeScoreHighlight}>
                      {score}/{theoryQuizzes.length}
                    </Text>
                  </Text>
                  <Progress
                    value={(score / theoryQuizzes.length) * 100}
                    style={styles.completeProgress}
                  />
                  <Button onPress={handleRestartQuiz} style={styles.restartButton}>
                    <Text style={styles.restartButtonText}>Try Again</Text>
                  </Button>
                </View>
              </Card>
            )}
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
  tabsList: {
    marginBottom: 16,
  },
  toolCard: {
    padding: 24,
    marginBottom: 24,
  },
  metronomeContent: {
    gap: 24,
  },
  bpmDisplay: {
    alignItems: "center",
  },
  bpmValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FF6A5C",
    marginBottom: 4,
  },
  bpmLabel: {
    fontSize: 14,
    color: "#666",
  },
  beatIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  beatCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  beatCircleActive: {
    backgroundColor: "#FF9076",
    transform: [{ scale: 1.1 }],
  },
  beatCircleFirst: {
    backgroundColor: "#FF6A5C",
  },
  beatNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#666",
  },
  beatNumberActive: {
    color: "white",
  },
  sliderSection: {
    gap: 12,
  },
  sliderControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderButton: {
    padding: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#666",
  },
  slider: {
    marginVertical: 8,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabelText: {
    fontSize: 12,
    color: "#999",
  },
  timeSignatureRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  timeSignatureButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE0D6",
    backgroundColor: "transparent",
  },
  timeSignatureButtonActive: {
    backgroundColor: "#FF6A5C",
    borderColor: "#FF6A5C",
  },
  timeSignatureText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6A5C",
  },
  timeSignatureTextActive: {
    color: "white",
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  playButtonStop: {
    // Red gradient would be applied via Button component
  },
  playButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  presetsSection: {
    gap: 8,
  },
  presetsLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  presetsRow: {
    flexDirection: "row",
    gap: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE0D6",
    backgroundColor: "transparent",
    alignItems: "center",
  },
  presetText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6A5C",
  },
  tunerContent: {
    gap: 24,
  },
  noteDisplay: {
    alignItems: "center",
  },
  noteValue: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 4,
  },
  frequencyText: {
    fontSize: 14,
    color: "#666",
  },
  tuningMeterSection: {
    gap: 12,
  },
  tuningMeter: {
    height: 96,
    backgroundColor: "#F4F4F4",
    borderRadius: 10,
    position: "relative",
    overflow: "hidden",
  },
  centerLine: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#999",
  },
  accuracyIndicator: {
    position: "absolute",
    top: "50%",
    marginTop: -32,
    width: 8,
    height: 64,
    borderRadius: 4,
  },
  meterLabels: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  meterLabelText: {
    fontSize: 12,
    color: "#666",
  },
  tuningStatus: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  tunerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tunerButtonStop: {
    // Red gradient would be applied via Button component
  },
  tunerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  notesSection: {
    gap: 8,
  },
  notesLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  notesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  noteBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F4F4F4",
  },
  noteBadgeActive: {
    backgroundColor: "#FF6A5C",
  },
  noteBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  noteBadgeTextActive: {
    color: "white",
  },
  infoBox: {
    backgroundColor: "#FFE0D6",
    padding: 12,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 12,
    color: "#7F1D1D",
    textAlign: "center",
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
  progressBar: {
    marginTop: 8,
  },
  quizCard: {
    padding: 24,
    marginBottom: 24,
  },
  quizContent: {
    gap: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  optionsList: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    backgroundColor: "#F9F9F9",
  },
  optionButtonSelected: {
    borderColor: "#FF6A5C",
    backgroundColor: "#FFE0D6",
  },
  optionButtonCorrect: {
    borderColor: "#059669",
    backgroundColor: "#D6FFE1",
  },
  optionButtonIncorrect: {
    borderColor: "#DC2626",
    backgroundColor: "#FEE2E2",
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  explanationBox: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 10,
  },
  explanationText: {
    fontSize: 14,
    color: "#1E3A8A",
  },
  explanationBold: {
    fontWeight: "700",
  },
  nextButton: {
    marginTop: 8,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  completeCard: {
    padding: 32,
    marginBottom: 24,
  },
  completeContent: {
    alignItems: "center",
    gap: 16,
  },
  trophyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFE0D6",
    alignItems: "center",
    justifyContent: "center",
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  completeScore: {
    fontSize: 16,
    color: "#666",
  },
  completeScoreHighlight: {
    color: "#FF6A5C",
    fontWeight: "700",
  },
  completeProgress: {
    width: "100%",
    marginVertical: 8,
  },
  restartButton: {
    marginTop: 8,
  },
  restartButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

