import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "../../lib/api";
import { getStoredUser } from "../../lib/auth";

interface Resource {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  externalUrl: string;
  fileType: "pdf" | "image" | "audio" | "video" | "link";
  fileSize: number;
  instrument: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  uploadedBy: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  assignedTo?: Array<{
    _id: string;
    name: string;
    email?: string;
    profileImage?: string;
  }>;
  assignments?: Array<{
    student: {
      _id: string;
      name: string;
      email?: string;
      profileImage?: string;
    };
    note: string;
    updatedAt: string;
    createdAt: string;
  }>;
  createdAt: string;
}

const INSTRUMENT_OPTIONS = [
  "piano",
  "guitar",
  "violin",
  "voice",
  "drums",
  "bass",
  "saxophone",
  "flute",
  "trumpet",
  "clarinet",
  "cello",
  "trombone",
  "banjo",
  "accordion",
  "oboe",
  "mandolin",
  "synth",
  "percussion",
  "harp",
  "ukulele",
  "Music Theory",
];

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

const CATEGORY_OPTIONS = [
  "Theory",
  "Technique",
  "Songs",
  "Exercises",
  "Scales",
  "Tutorials",
  "Other",
];

/**
 * Teacher Resources Screen
 * 3 Tabs: My Resources, Assignments, Challenges
 */
interface Student {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Challenge {
  _id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  participantCount?: number;
  participants?: Array<{ _id: string; name: string; profileImage?: string }>;
  deadline: string;
  reward: string;
  requirements: {
    type: "practice_days" | "practice_sessions" | "recording" | "manual";
    target: number;
    description: string;
  };
  createdBy: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  instrument: string;
  category: string;
  status: "draft" | "active" | "completed" | "cancelled";
  participantProgress?: Array<{
    student: { _id: string; name: string; email?: string; profileImage?: string };
    progress: number;
    currentValue: number;
    completed: boolean;
    completedAt?: string;
  }>;
}

export default function TeacherResourcesScreen() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [assignedResources, setAssignedResources] = useState<Resource[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedResourceForAssign, setSelectedResourceForAssign] = useState<Resource | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assignmentNotes, setAssignmentNotes] = useState<Record<string, string>>({}); // studentId -> note
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<{ resourceId: string; studentId: string; note: string } | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [user, setUser] = useState<any>(null);
  
  // Challenge state
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [draftChallenges, setDraftChallenges] = useState<Challenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [challengeSubtab, setChallengeSubtab] = useState<"all" | "active" | "drafts">("all");
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  
  // Challenge form state
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeDifficulty, setChallengeDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [challengeDeadline, setChallengeDeadline] = useState("");
  const [challengeReward, setChallengeReward] = useState("");
  const [challengeRequirementType, setChallengeRequirementType] = useState<"practice_days" | "practice_sessions" | "recording" | "manual">("practice_days");
  const [challengeRequirementTarget, setChallengeRequirementTarget] = useState("");
  const [challengeRequirementDesc, setChallengeRequirementDesc] = useState("");
  const [challengeInstrument, setChallengeInstrument] = useState("");
  const [challengeCategory, setChallengeCategory] = useState("");
  const [challengeVisibility, setChallengeVisibility] = useState<"public" | "private">("public");
  const [challengeAssignedStudents, setChallengeAssignedStudents] = useState<string[]>([]);

  // Upload form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instrument, setInstrument] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadResources();
    loadAssignedResources();
    loadStudents();
    loadChallenges();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getStoredUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await api("/api/resources/me", {
        method: "GET",
        auth: true,
      });
      setResources(response || []);
    } catch (error: any) {
      console.error("Error loading resources:", error);
      Alert.alert(
        "Error Loading Resources",
        error.message || "Failed to load resources."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedResources = async () => {
    try {
      const response = await api("/api/resources/assignments", {
        method: "GET",
        auth: true,
      });
      setAssignedResources(response || []);
    } catch (error: any) {
      console.error("Error loading assigned resources:", error);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const studentMap = new Map<string, Student>();
      
      // Load students from bookings (active students)
      try {
        const bookings = await api("/api/bookings/teacher/me", { auth: true });
        (Array.isArray(bookings) ? bookings : []).forEach((booking: any) => {
          if (booking.student) {
            const student = booking.student._id ? booking.student : booking.student;
            const studentId = student._id ? String(student._id) : String(student);
            
            if (!studentMap.has(studentId)) {
              studentMap.set(studentId, {
                _id: studentId,
                name: student.name || "Student",
                email: student.email || "",
                profileImage: student.profileImage || "",
              });
            }
          }
        });
      } catch (error) {
        console.error("Error loading students from bookings:", error);
      }
      
      // Load students from inquiries (students in conversation)
      try {
        const inquiries = await api("/api/inquiries/teacher/me", { auth: true });
        (Array.isArray(inquiries) ? inquiries : []).forEach((inquiry: any) => {
          if (inquiry.student) {
            const student = inquiry.student._id ? inquiry.student : inquiry.student;
            const studentId = student._id ? String(student._id) : String(student);
            
            // Only add if not already in map (bookings take priority for profileImage)
            if (!studentMap.has(studentId)) {
              studentMap.set(studentId, {
                _id: studentId,
                name: student.name || "Student",
                email: student.email || "",
                profileImage: student.profileImage || "",
              });
            }
          }
        });
      } catch (error) {
        console.error("Error loading students from inquiries:", error);
      }

      // Sort students alphabetically by name
      const studentsList = Array.from(studentMap.values());
      studentsList.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(studentsList);
    } catch (error: any) {
      console.error("Error loading students:", error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*", "audio/*", "video/*"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setExternalUrl("");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const uploadResource = async () => {
    if (!title || !instrument || !level) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!selectedFile && !externalUrl) {
      Alert.alert("Error", "Please either upload a file or provide an external URL");
      return;
    }

    try {
      setUploading(true);

      let fileUrl = "";
      let fileSize = 0;
      let fileType: "pdf" | "image" | "audio" | "video" | "link" = "link";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || "application/pdf",
          name: selectedFile.name || selectedFile.uri.split("/").pop() || "resource",
        } as any);

        const uploadResponse = await api("/api/uploads/resource-file", {
          method: "POST",
          auth: true,
          body: formData,
        });

        fileUrl = uploadResponse.url;
        fileSize = uploadResponse.fileSize;
        fileType = uploadResponse.fileType;
      } else {
        fileUrl = externalUrl;
        fileType = "link";
      }

      const resourceData = {
        title,
        description: description || "",
        fileUrl: selectedFile ? fileUrl : "",
        externalUrl: selectedFile ? "" : fileUrl,
        fileType,
        fileSize,
        instrument,
        level,
        category: category || "",
      };

      await api("/api/resources", {
        method: "POST",
        auth: true,
        body: JSON.stringify(resourceData),
      });

      Alert.alert("Success", "Resource uploaded successfully!");
      setShowUploadModal(false);
      resetForm();
      loadResources();
    } catch (error: any) {
      console.error("Error uploading resource:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to upload resource. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const deleteResource = (resourceId: string, resourceTitle: string) => {
    Alert.alert(
      "Delete Resource",
      `Are you sure you want to delete "${resourceTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api(`/api/resources/${resourceId}`, {
                method: "DELETE",
                auth: true,
              });
              Alert.alert("Success", "Resource deleted successfully");
              loadResources();
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete resource. Please try again.");
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setInstrument("");
    setLevel("");
    setCategory("");
    setExternalUrl("");
    setSelectedFile(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <Ionicons name="document-text" size={20} color="#DC2626" />;
      case "image":
        return <Ionicons name="image" size={20} color="#10B981" />;
      case "audio":
        return <Ionicons name="musical-notes" size={20} color="#FF6A5C" />;
      case "video":
        return <Ionicons name="videocam" size={20} color="#2563EB" />;
      case "link":
        return <Ionicons name="link" size={20} color="#8B5CF6" />;
      default:
        return <Ionicons name="document" size={20} color="#666" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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

  const handleAssignClick = (resource: Resource) => {
    setSelectedResourceForAssign(resource);
    // Pre-select already assigned students
    const assignedIds = (resource.assignedTo || []).map((s: any) => 
      s._id ? String(s._id) : String(s)
    );
    setSelectedStudentIds(assignedIds);
    // Load existing notes if any
    if (resource.assignments && Array.isArray(resource.assignments)) {
      const notesMap: Record<string, string> = {};
      resource.assignments.forEach((assignment: any) => {
        if (assignment.student && assignment.student._id) {
          notesMap[assignment.student._id] = assignment.note || "";
        }
      });
      setAssignmentNotes(notesMap);
    } else {
      setAssignmentNotes({});
    }
    setShowAssignModal(true);
  };

  const handleAssignResource = async () => {
    if (!selectedResourceForAssign || selectedStudentIds.length === 0) {
      Alert.alert("Error", "Please select at least one student");
      return;
    }

    try {
      setAssigning(true);
      // Prepare notes object: { studentId: note }
      const notes: Record<string, string> = {};
      selectedStudentIds.forEach((studentId) => {
        notes[studentId] = assignmentNotes[studentId] || "";
      });

      await api(`/api/resources/${selectedResourceForAssign._id}/assign`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({ studentIds: selectedStudentIds, notes }),
      });

      Alert.alert("Success", "Resource assigned successfully!");
      setShowAssignModal(false);
      setSelectedResourceForAssign(null);
      setSelectedStudentIds([]);
      setAssignmentNotes({});
      loadResources();
      loadAssignedResources();
    } catch (error: any) {
      console.error("Error assigning resource:", error);
      Alert.alert("Error", error.message || "Failed to assign resource.");
    } finally {
      setAssigning(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const updateAssignmentNote = async (resourceId: string, studentId: string, note: string) => {
    try {
      await api(`/api/resources/${resourceId}/assign/${studentId}/note`, {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ note }),
      });
      Alert.alert("Success", "Note updated successfully!");
      loadAssignedResources();
    } catch (error: any) {
      console.error("Error updating note:", error);
      Alert.alert("Error", error.message || "Failed to update note.");
    }
  };

  const deleteAssignmentNote = async (resourceId: string, studentId: string) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api(`/api/resources/${resourceId}/assign/${studentId}/note`, {
                method: "DELETE",
                auth: true,
              });
              Alert.alert("Success", "Note deleted successfully!");
              loadAssignedResources();
            } catch (error: any) {
              console.error("Error deleting note:", error);
              Alert.alert("Error", error.message || "Failed to delete note.");
            }
          },
        },
      ]
    );
  };

  const openEditNoteModal = (resourceId: string, studentId: string, currentNote: string) => {
    setEditingNote({ resourceId, studentId, note: currentNote });
    setEditNoteText(currentNote);
    setShowEditNoteModal(true);
  };

  const saveEditedNote = async () => {
    if (!editingNote) return;

    try {
      await updateAssignmentNote(editingNote.resourceId, editingNote.studentId, editNoteText);
      setShowEditNoteModal(false);
      setEditingNote(null);
      setEditNoteText("");
    } catch (error) {
      // Error already handled in updateAssignmentNote
    }
  };

  const renderAssignmentCard = (resource: Resource) => {
    if (!resource.assignments || resource.assignments.length === 0) {
      return null;
    }

    return (
      <Card key={resource._id} style={styles.resourceCard}>
        <View style={styles.resourceRow}>
          <View style={styles.resourceIcon}>
            {getIcon(resource.fileType)}
          </View>
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceName}>{resource.title}</Text>
            <View style={styles.resourceMeta}>
              <Badge variant="default" style={styles.levelBadge}>
                {resource.level}
              </Badge>
              <Text style={styles.resourceInstrument}>{resource.instrument}</Text>
            </View>
            <Text style={styles.resourceDate}>
              Assigned to {resource.assignments.length} student{resource.assignments.length > 1 ? 's' : ''}
            </Text>
            
            {/* Show assignments with notes */}
            {resource.assignments.map((assignment) => (
              <View key={assignment.student._id} style={styles.assignmentItem}>
                <View style={styles.assignmentHeader}>
                  <View style={styles.studentInfo}>
                    <View style={styles.studentAvatar}>
                      {assignment.student.profileImage ? (
                        <Text style={styles.avatarText}>
                          {assignment.student.name.charAt(0).toUpperCase()}
                        </Text>
                      ) : (
                        <Ionicons name="person" size={16} color="#666" />
                      )}
                    </View>
                    <Text style={styles.studentName}>{assignment.student.name}</Text>
                  </View>
                  {assignment.note && (
                    <View style={styles.noteActions}>
                      <TouchableOpacity
                        onPress={() => openEditNoteModal(resource._id, assignment.student._id, assignment.note)}
                        style={styles.noteActionButton}
                      >
                        <Ionicons name="create-outline" size={16} color="#FF6A5C" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteAssignmentNote(resource._id, assignment.student._id)}
                        style={styles.noteActionButton}
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {assignment.note ? (
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteText}>{assignment.note}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addNoteButton}
                    onPress={() => openEditNoteModal(resource._id, assignment.student._id, "")}
                  >
                    <Ionicons name="add-circle-outline" size={16} color="#FF6A5C" />
                    <Text style={styles.addNoteText}>Add note for {assignment.student.name}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      </Card>
    );
  };

  // Load challenges created by teacher
  const loadChallenges = async () => {
    try {
      setLoadingChallenges(true);
      const response = await api("/api/challenges/teacher/me", {
        method: "GET",
        auth: true,
      });
      
      const allChallenges = response || [];
      setMyChallenges(allChallenges);
      setActiveChallenges(allChallenges.filter((c: Challenge) => c.status === "active"));
      setDraftChallenges(allChallenges.filter((c: Challenge) => c.status === "draft"));
    } catch (error: any) {
      console.error("Error loading challenges:", error);
      setMyChallenges([]);
      setActiveChallenges([]);
      setDraftChallenges([]);
    } finally {
      setLoadingChallenges(false);
    }
  };

  // Create or update challenge
  const saveChallenge = async () => {
    try {
      if (!challengeTitle || !challengeDescription || !challengeDeadline || !challengeRequirementTarget || !challengeRequirementDesc || !challengeInstrument) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      const challengeData = {
        title: challengeTitle,
        description: challengeDescription,
        difficulty: challengeDifficulty,
        deadline: challengeDeadline,
        reward: challengeReward,
        requirements: {
          type: challengeRequirementType,
          target: parseInt(challengeRequirementTarget),
          description: challengeRequirementDesc,
        },
        instrument: challengeInstrument,
        category: challengeCategory,
        visibility: challengeVisibility,
        assignedStudents: challengeVisibility === "private" ? challengeAssignedStudents : [],
        status: editingChallenge ? editingChallenge.status : "draft",
      };

      if (editingChallenge) {
        await api(`/api/challenges/${editingChallenge._id}`, {
          method: "PUT",
          auth: true,
          body: challengeData,
        });
        Alert.alert("Success", "Challenge updated successfully");
      } else {
        await api("/api/challenges", {
          method: "POST",
          auth: true,
          body: challengeData,
        });
        Alert.alert("Success", "Challenge created successfully");
      }

      resetChallengeForm();
      setShowChallengeModal(false);
      await loadChallenges();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save challenge");
    }
  };

  // Delete challenge
  const deleteChallenge = async (challengeId: string, challengeTitle: string) => {
    Alert.alert(
      "Delete Challenge",
      `Are you sure you want to delete "${challengeTitle}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api(`/api/challenges/${challengeId}`, {
                method: "DELETE",
                auth: true,
              });
              Alert.alert("Success", "Challenge deleted successfully");
              await loadChallenges();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete challenge");
            }
          },
        },
      ]
    );
  };

  // Activate challenge
  const activateChallenge = async (challengeId: string) => {
    try {
      await api(`/api/challenges/${challengeId}`, {
        method: "PUT",
        auth: true,
        body: { status: "active" },
      });
      Alert.alert("Success", "Challenge activated");
      await loadChallenges();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to activate challenge");
    }
  };

  // Reset challenge form
  const resetChallengeForm = () => {
    setChallengeTitle("");
    setChallengeDescription("");
    setChallengeDifficulty("Beginner");
    setChallengeDeadline("");
    setChallengeReward("");
    setChallengeRequirementType("practice_days");
    setChallengeRequirementTarget("");
    setChallengeRequirementDesc("");
    setChallengeInstrument("");
    setChallengeCategory("");
    setChallengeVisibility("public");
    setChallengeAssignedStudents([]);
    setEditingChallenge(null);
  };

  // Open challenge modal for editing
  const openEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setChallengeTitle(challenge.title);
    setChallengeDescription(challenge.description);
    setChallengeDifficulty(challenge.difficulty);
    setChallengeDeadline(new Date(challenge.deadline).toISOString().split('T')[0]);
    setChallengeReward(challenge.reward);
    setChallengeRequirementType(challenge.requirements.type);
    setChallengeRequirementTarget(challenge.requirements.target.toString());
    setChallengeRequirementDesc(challenge.requirements.description);
    setChallengeInstrument(challenge.instrument);
    setChallengeCategory(challenge.category);
    setChallengeVisibility(challenge.visibility || "public");
    setShowChallengeModal(true);
  };

  const renderChallengeCard = (challenge: Challenge) => (
    <Card key={challenge._id} style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>
            {challenge.description}
          </Text>
        </View>
        <View style={styles.challengeStatusBadge}>
          <View style={[
            styles.statusIndicator,
            challenge.status === "active" && styles.statusActive,
            challenge.status === "draft" && styles.statusDraft,
            challenge.status === "completed" && styles.statusCompleted,
          ]}>
            <Text style={styles.statusText}>{challenge.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.challengeMeta}>
        <View style={[styles.levelBadge, { backgroundColor: "#FF6A5C" }]}>
          <Text style={styles.levelBadgeText}>{challenge.difficulty}</Text>
        </View>
        {challenge.instrument && (
          <View style={[styles.categoryBadge, { backgroundColor: "#FF9076" }]}>
            <Text style={styles.categoryBadgeText}>{challenge.instrument}</Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={14} color="#666" />
          <Text style={styles.metaText}>{challenge.participantCount || challenge.participants?.length || 0} participants</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.metaText}>{formatDate(challenge.deadline)}</Text>
        </View>
      </View>

      {challenge.requirements && (
        <View style={styles.requirementsBox}>
          <Text style={styles.requirementsText}>
            📋 {challenge.requirements.description}
          </Text>
        </View>
      )}

      {challenge.reward && (
        <View style={styles.rewardBox}>
          <Text style={styles.rewardText}>🎁 Reward: {challenge.reward}</Text>
        </View>
      )}

      {/* Participant Progress */}
      {challenge.participantProgress && challenge.participantProgress.length > 0 && (
        <View style={styles.participantProgressSection}>
          <Text style={styles.participantProgressTitle}>Participant Progress:</Text>
          {challenge.participantProgress.map((progress) => (
            <View key={progress.student._id} style={styles.participantItem}>
              <Text style={styles.participantName}>{progress.student.name}</Text>
              <View style={styles.participantProgressBar}>
                <Progress value={progress.progress} style={styles.progressBar} />
                <Text style={styles.participantProgressText}>
                  {progress.progress}% ({progress.currentValue}/{challenge.requirements.target})
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.challengeActions}>
        {challenge.status === "draft" && (
          <Button
            onPress={() => activateChallenge(challenge._id)}
            style={styles.activateButton}
          >
            <Text style={styles.activateButtonText}>Activate</Text>
          </Button>
        )}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditChallenge(challenge)}
        >
          <Ionicons name="create-outline" size={16} color="#FF6A5C" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteChallenge(challenge._id, challenge.title)}
        >
          <Ionicons name="trash-outline" size={16} color="#DC2626" />
          <Text style={[styles.actionButtonText, { color: "#DC2626" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderResourceCard = (resource: Resource) => (
    <Card key={resource._id} style={styles.resourceCard}>
      <View style={styles.resourceRow}>
        <View style={styles.resourceIcon}>
          {getIcon(resource.fileType)}
        </View>
        <View style={styles.resourceInfo}>
          <Text style={styles.resourceName}>{resource.title}</Text>
          {resource.description ? (
            <Text style={styles.resourceDescription}>
              {resource.description}
            </Text>
          ) : null}
          <View style={styles.resourceMeta}>
            <Badge variant="default" style={styles.levelBadge}>
              {resource.level}
            </Badge>
            {resource.category ? (
              <Badge variant="default" style={styles.categoryBadge}>
                {resource.category}
              </Badge>
            ) : null}
            <Text style={styles.resourceInstrument}>
              {resource.instrument}
            </Text>
            {resource.fileSize > 0 ? (
              <Text style={styles.resourceSize}>
                {formatFileSize(resource.fileSize)}
              </Text>
            ) : null}
          </View>
          <Text style={styles.resourceDate}>
            Uploaded {formatDate(resource.createdAt)}
          </Text>
          {(resource.assignedTo && resource.assignedTo.length > 0) && (
            <View style={styles.assignedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.assignedText}>
                Assigned to {resource.assignedTo.length} student{resource.assignedTo.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          <View style={styles.resourceActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.assignButton]}
              onPress={() => handleAssignClick(resource)}
            >
              <Ionicons name="person-add-outline" size={16} color="#FF6A5C" />
              <Text style={[styles.actionButtonText, { color: "#FF6A5C" }]}>
                Assign
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => deleteResource(resource._id, resource.title)}
            >
              <Ionicons name="trash-outline" size={16} color="#DC2626" />
              <Text style={[styles.actionButtonText, { color: "#DC2626" }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

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
        <Text style={styles.headerTitle}>Resources</Text>
        <Text style={styles.headerSubtitle}>
          Manage your teaching content and assignments
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Upload Button */}
        <Button
          onPress={() => setShowUploadModal(true)}
          style={styles.uploadButton}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.uploadButtonText}>Upload Resource</Text>
        </Button>

        {/* Main Tabs */}
        <Tabs defaultValue="myResources">
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="myResources">My Resources</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>

          {/* My Resources Tab */}
          <TabsContent value="myResources">
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6A5C" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : resources.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="cloud-upload-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>No resources uploaded yet</Text>
                <Text style={styles.emptySubtext}>
                  Upload your first resource to get started
                </Text>
              </Card>
            ) : (
              resources
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(renderResourceCard)
            )}
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6A5C" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : assignedResources.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>No assigned resources</Text>
                <Text style={styles.emptySubtext}>
                  Assign resources to students from "My Resources" tab
                </Text>
              </Card>
            ) : (
              assignedResources.map(renderAssignmentCard).filter(Boolean)
            )}
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <View style={styles.challengeHeaderActions}>
              <Button
                onPress={() => {
                  resetChallengeForm();
                  setShowChallengeModal(true);
                }}
                style={styles.createChallengeButton}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.createChallengeButtonText}>Create Challenge</Text>
              </Button>
            </View>

            <Tabs value={challengeSubtab} onValueChange={(v) => setChallengeSubtab(v as any)}>
              <TabsList style={styles.subTabsList}>
                <TabsTrigger value="all">My Challenges</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
              </TabsList>

              {/* All Challenges */}
              <TabsContent value="all">
                {loadingChallenges ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6A5C" />
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                ) : myChallenges.length === 0 ? (
                  <Card style={styles.emptyCard}>
                    <Ionicons name="flag-outline" size={48} color="#999" />
                    <Text style={styles.emptyText}>No challenges created</Text>
                    <Text style={styles.emptySubtext}>
                      Create challenges to motivate your students
                    </Text>
                  </Card>
                ) : (
                  myChallenges.map((c) => renderChallengeCard(c))
                )}
              </TabsContent>

              {/* Active Challenges */}
              <TabsContent value="active">
                {loadingChallenges ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6A5C" />
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                ) : activeChallenges.length === 0 ? (
                  <Card style={styles.emptyCard}>
                    <Ionicons name="checkmark-circle-outline" size={48} color="#999" />
                    <Text style={styles.emptyText}>No active challenges</Text>
                    <Text style={styles.emptySubtext}>
                      Activate your draft challenges to make them available to students
                    </Text>
                  </Card>
                ) : (
                  activeChallenges.map((c) => renderChallengeCard(c))
                )}
              </TabsContent>

              {/* Draft Challenges */}
              <TabsContent value="drafts">
                {loadingChallenges ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6A5C" />
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                ) : draftChallenges.length === 0 ? (
                  <Card style={styles.emptyCard}>
                    <Ionicons name="document-text-outline" size={48} color="#999" />
                    <Text style={styles.emptyText}>No draft challenges</Text>
                    <Text style={styles.emptySubtext}>
                      Create a new challenge to get started
                    </Text>
                  </Card>
                ) : (
                  draftChallenges.map((c) => renderChallengeCard(c))
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Resource</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowUploadModal(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., C Major Scale Practice Sheet"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Optional description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Instrument *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {INSTRUMENT_OPTIONS.map((inst) => (
                  <TouchableOpacity
                    key={inst}
                    style={[
                      styles.chip,
                      instrument === inst && styles.chipActive,
                    ]}
                    onPress={() => setInstrument(inst)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        instrument === inst && styles.chipTextActive,
                      ]}
                    >
                      {inst}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Level *</Text>
              <View style={styles.chipRow}>
                {LEVEL_OPTIONS.map((lev) => (
                  <TouchableOpacity
                    key={lev}
                    style={[styles.chip, level === lev && styles.chipActive]}
                    onPress={() => setLevel(lev)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        level === lev && styles.chipTextActive,
                      ]}
                    >
                      {lev}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, category === cat && styles.chipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        category === cat && styles.chipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Upload File or External URL</Text>
              {selectedFile ? (
                <View style={styles.fileInfo}>
                  <Ionicons name="document" size={20} color="#FF6A5C" />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <Ionicons name="close-circle" size={20} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Button
                    onPress={pickFile}
                    style={styles.fileButton}
                    size="sm"
                  >
                    <Ionicons name="document-attach" size={16} color="white" />
                    <Text style={styles.fileButtonText}>Pick File</Text>
                  </Button>
                  <Text style={styles.orText}>OR</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://example.com/resource"
                    value={externalUrl}
                    onChangeText={setExternalUrl}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                onPress={uploadResource}
                style={styles.submitButton}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={16} color="white" />
                    <Text style={styles.submitButtonText}>Upload</Text>
                  </>
                )}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Resource Modal */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAssignModal(false);
          setSelectedResourceForAssign(null);
          setSelectedStudentIds([]);
          setAssignmentNotes({});
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Assign: {selectedResourceForAssign?.title}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAssignModal(false);
                  setSelectedResourceForAssign(null);
                  setSelectedStudentIds([]);
                  setAssignmentNotes({});
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {loadingStudents ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF6A5C" />
                  <Text style={styles.loadingText}>Loading students...</Text>
                </View>
              ) : students.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons name="people-outline" size={48} color="#999" />
                  <Text style={styles.emptyText}>No students found</Text>
                  <Text style={styles.emptySubtext}>
                    Students will appear here once they book lessons with you or send you an inquiry
                  </Text>
                </Card>
              ) : (
                <>
                  <Text style={styles.label}>
                    Select students to assign this resource to:
                  </Text>
                  {students.map((student) => {
                    const isSelected = selectedStudentIds.includes(student._id);
                    return (
                      <View key={student._id}>
                        <TouchableOpacity
                          style={[
                            styles.studentItem,
                            isSelected && styles.studentItemSelected,
                          ]}
                          onPress={() => toggleStudentSelection(student._id)}
                        >
                          <View style={styles.studentInfo}>
                            <View style={styles.studentAvatar}>
                              {student.profileImage ? (
                                <Text style={styles.avatarText}>
                                  {student.name.charAt(0).toUpperCase()}
                                </Text>
                              ) : (
                                <Ionicons
                                  name="person"
                                  size={20}
                                  color="#666"
                                />
                              )}
                            </View>
                            <View style={styles.studentDetails}>
                              <Text style={styles.studentName}>
                                {student.name}
                              </Text>
                              {student.email && (
                                <Text style={styles.studentEmail}>
                                  {student.email}
                                </Text>
                              )}
                            </View>
                          </View>
                          <Ionicons
                            name={
                              isSelected
                                ? "checkmark-circle"
                                : "ellipse-outline"
                            }
                            size={24}
                            color={isSelected ? "#FF6A5C" : "#999"}
                          />
                        </TouchableOpacity>
                        {isSelected && (
                          <View style={styles.noteInputContainer}>
                            <Text style={styles.noteLabel}>
                              Note for {student.name} (optional):
                            </Text>
                            <TextInput
                              style={[styles.input, styles.noteInput]}
                              placeholder="e.g., Practice this daily for 15 minutes. Focus on..."
                              value={assignmentNotes[student._id] || ""}
                              onChangeText={(text) =>
                                setAssignmentNotes((prev) => ({
                                  ...prev,
                                  [student._id]: text,
                                }))
                              }
                              multiline
                              numberOfLines={4}
                              textAlignVertical="top"
                            />
                          </View>
                        )}
                      </View>
                    );
                  })}
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                onPress={handleAssignResource}
                style={styles.submitButton}
                disabled={assigning || selectedStudentIds.length === 0}
              >
                {assigning ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="white" />
                    <Text style={styles.submitButtonText}>
                      Assign to {selectedStudentIds.length} student
                      {selectedStudentIds.length !== 1 ? "s" : ""}
                    </Text>
                  </>
                )}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Note Modal */}
      <Modal
        visible={showEditNoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowEditNoteModal(false);
          setEditingNote(null);
          setEditNoteText("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingNote?.note ? "Edit Note" : "Add Note"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEditNoteModal(false);
                  setEditingNote(null);
                  setEditNoteText("");
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>
                Note for this assignment (optional):
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, styles.noteInput]}
                placeholder="e.g., Practice this daily for 15 minutes. Focus on..."
                value={editNoteText}
                onChangeText={setEditNoteText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                onPress={saveEditedNote}
                style={styles.submitButton}
              >
                <Ionicons name="checkmark" size={16} color="white" />
                <Text style={styles.submitButtonText}>Save Note</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Challenge Modal */}
      <Modal
        visible={showChallengeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowChallengeModal(false);
          resetChallengeForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingChallenge ? "Edit Challenge" : "Create Challenge"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowChallengeModal(false);
                  resetChallengeForm();
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 30-Day Practice Streak"
                value={challengeTitle}
                onChangeText={setChallengeTitle}
              />

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the challenge..."
                value={challengeDescription}
                onChangeText={setChallengeDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Difficulty *</Text>
              <View style={styles.chipScroll}>
                {LEVEL_OPTIONS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.chip,
                      challengeDifficulty === level && styles.chipActive,
                    ]}
                    onPress={() => setChallengeDifficulty(level as any)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        challengeDifficulty === level && styles.chipTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Instrument *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {INSTRUMENT_OPTIONS.map((inst) => (
                  <TouchableOpacity
                    key={inst}
                    style={[
                      styles.chip,
                      challengeInstrument === inst && styles.chipActive,
                    ]}
                    onPress={() => setChallengeInstrument(inst)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        challengeInstrument === inst && styles.chipTextActive,
                      ]}
                    >
                      {inst}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Category (Optional)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      challengeCategory === cat && styles.chipActive,
                    ]}
                    onPress={() => setChallengeCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        challengeCategory === cat && styles.chipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Deadline *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={challengeDeadline}
                onChangeText={setChallengeDeadline}
              />

              <Text style={styles.label}>Reward (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Practice Badge, Certificate"
                value={challengeReward}
                onChangeText={setChallengeReward}
              />

              <Text style={styles.label}>Requirement Type *</Text>
              <View style={styles.chipScroll}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    challengeRequirementType === "practice_days" && styles.chipActive,
                  ]}
                  onPress={() => {
                    setChallengeRequirementType("practice_days");
                    setChallengeRequirementDesc("Practice for X consecutive days");
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      challengeRequirementType === "practice_days" && styles.chipTextActive,
                    ]}
                  >
                    Practice Days
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    challengeRequirementType === "practice_sessions" && styles.chipActive,
                  ]}
                  onPress={() => {
                    setChallengeRequirementType("practice_sessions");
                    setChallengeRequirementDesc("Complete X practice sessions");
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      challengeRequirementType === "practice_sessions" && styles.chipTextActive,
                    ]}
                  >
                    Practice Sessions
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    challengeRequirementType === "recording" && styles.chipActive,
                  ]}
                  onPress={() => {
                    setChallengeRequirementType("recording");
                    setChallengeRequirementDesc("Submit X recordings");
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      challengeRequirementType === "recording" && styles.chipTextActive,
                    ]}
                  >
                    Recording
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    challengeRequirementType === "manual" && styles.chipActive,
                  ]}
                  onPress={() => {
                    setChallengeRequirementType("manual");
                    setChallengeRequirementDesc("Manual verification required");
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      challengeRequirementType === "manual" && styles.chipTextActive,
                    ]}
                  >
                    Manual
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Requirement Target *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 30"
                value={challengeRequirementTarget}
                onChangeText={setChallengeRequirementTarget}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Requirement Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Practice for 30 consecutive days"
                value={challengeRequirementDesc}
                onChangeText={setChallengeRequirementDesc}
                multiline
                numberOfLines={2}
              />

              <Text style={styles.label}>Visibility</Text>
              <View style={styles.chipScroll}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    challengeVisibility === "public" && styles.chipActive,
                  ]}
                  onPress={() => setChallengeVisibility("public")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      challengeVisibility === "public" && styles.chipTextActive,
                    ]}
                  >
                    Public
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    challengeVisibility === "private" && styles.chipActive,
                  ]}
                  onPress={() => setChallengeVisibility("private")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      challengeVisibility === "private" && styles.chipTextActive,
                    ]}
                  >
                    Private
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                onPress={saveChallenge}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>
                  {editingChallenge ? "Update Challenge" : "Create Challenge"}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  tabsList: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  resourceCard: {
    padding: 16,
    marginBottom: 12,
  },
  resourceRow: {
    flexDirection: "row",
    gap: 12,
  },
  resourceIcon: {
    backgroundColor: "#F4F4F4",
    padding: 12,
    borderRadius: 10,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  resourceMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  levelBadge: {
    alignSelf: "flex-start",
  },
  categoryBadge: {
    alignSelf: "flex-start",
  },
  resourceInstrument: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  resourceSize: {
    fontSize: 12,
    color: "#666",
  },
  resourceDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  assignedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#D6FFE1",
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  assignedText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
  },
  resourceActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "transparent",
    alignSelf: "flex-start",
  },
  assignButton: {
    borderColor: "#FF6A5C",
  },
  deleteButton: {
    borderColor: "#FCA5A5",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  studentItemSelected: {
    backgroundColor: "#FFF3C4",
    borderColor: "#FF6A5C",
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  chipScroll: {
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F4F4F4",
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: "#FF6A5C",
  },
  chipText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "white",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },
  fileButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  orText: {
    textAlign: "center",
    color: "#999",
    marginVertical: 8,
    fontSize: 12,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  noteInputContainer: {
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  noteInput: {
    minHeight: 80,
    fontSize: 14,
  },
  assignmentItem: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF6A5C",
  },
  assignmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteContainer: {
    marginTop: 8,
  },
  noteText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
  },
  noteActions: {
    flexDirection: "row",
    gap: 8,
  },
  noteActionButton: {
    padding: 4,
  },
  addNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: "#FFF3C4",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  addNoteText: {
    fontSize: 12,
    color: "#FF6A5C",
    fontWeight: "500",
  },
  challengeHeaderActions: {
    marginBottom: 16,
  },
  createChallengeButton: {
    backgroundColor: "#FF6A5C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createChallengeButtonText: {
    color: "white",
    fontWeight: "600",
  },
  subTabsList: {
    marginBottom: 16,
  },
  challengeCard: {
    marginBottom: 16,
    padding: 16,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: "#666",
  },
  challengeStatusBadge: {
    marginLeft: 12,
  },
  statusIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#E5E5E5",
  },
  statusActive: {
    backgroundColor: "#D6FFE1",
  },
  statusDraft: {
    backgroundColor: "#FFF3C4",
  },
  statusCompleted: {
    backgroundColor: "#E8F4F8",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
  },
  challengeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
  },
  requirementsBox: {
    backgroundColor: "#E8F4F8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  requirementsText: {
    fontSize: 13,
    color: "#333",
  },
  rewardBox: {
    backgroundColor: "#FFF3C4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  rewardText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  participantProgressSection: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
  },
  participantProgressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  participantItem: {
    marginBottom: 12,
  },
  participantName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  participantProgressBar: {
    marginTop: 4,
  },
  participantProgressText: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
  challengeActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 12,
  },
  activateButton: {
    backgroundColor: "#10B981",
    flex: 1,
    minWidth: 100,
  },
  activateButtonText: {
    color: "white",
    fontWeight: "600",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6A5C",
  },
  editButtonText: {
    fontSize: 14,
    color: "#FF6A5C",
    fontWeight: "500",
  },
  progressBar: {
    height: 8,
  },
});
