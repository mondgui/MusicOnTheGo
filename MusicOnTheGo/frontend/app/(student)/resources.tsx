import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Share,
  TextInput,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  assignmentNote?: string;
  assignmentTeacher?: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  assignmentUpdatedAt?: string;
  createdAt: string;
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
  progress?: number;
  currentValue?: number;
  isJoined?: boolean;
  isCompleted?: boolean;
  completedAt?: string;
}

const INSTRUMENT_OPTIONS = [
  "All",
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

const LEVEL_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

const TOPIC_CATEGORIES = [
  "All",
  "Theory",
  "Technique",
  "Songs",
  "Exercises",
  "Scales",
  "Tutorials",
  "Other",
];

/**
 * Student Resources Screen
 * 3 Tabs: Assigned, Browse, Challenges
 */
export default function ResourcesScreen() {
  const router = useRouter();
  const [assignedResources, setAssignedResources] = useState<Resource[]>([]);
  const [personalFiles, setPersonalFiles] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [loadingPersonal, setLoadingPersonal] = useState(true);
  const [savedResources, setSavedResources] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [discoverChallenges, setDiscoverChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [challengeSubtab, setChallengeSubtab] = useState<"active" | "discover" | "completed">("active");
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({}); // resourceId -> expanded
  const [user, setUser] = useState<any>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instrument, setInstrument] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [category, setCategory] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadMyChallenges();
    loadDiscoverChallenges();
    loadAssignedResources();
    loadPersonalFiles();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getStoredUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadPersonalFiles = async () => {
    try {
      setLoadingPersonal(true);
      const response = await api("/api/resources/personal", {
        method: "GET",
        auth: true,
      });
      setPersonalFiles(response || []);
    } catch (error: any) {
      console.error("Error loading personal files:", error);
      setPersonalFiles([]);
    } finally {
      setLoadingPersonal(false);
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

  const uploadPersonalFile = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a file name");
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
        instrument: instrument || "Other",
        level: level || "Beginner",
        category: category || "",
      };

      await api("/api/resources/personal", {
        method: "POST",
        auth: true,
        body: JSON.stringify(resourceData),
      });

      Alert.alert("Success", "File uploaded successfully!");
      setShowUploadModal(false);
      resetUploadForm();
      loadPersonalFiles();
    } catch (error: any) {
      console.error("Error uploading file:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to upload file. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setTitle("");
    setDescription("");
    setInstrument("");
    setLevel("Beginner");
    setCategory("");
    setExternalUrl("");
    setSelectedFile(null);
  };

  const deletePersonalFile = (resourceId: string, resourceTitle: string) => {
    Alert.alert(
      "Delete File",
      `Are you sure you want to delete "${resourceTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api(`/api/resources/personal/${resourceId}`, {
                method: "DELETE",
                auth: true,
              });
              Alert.alert("Success", "File deleted successfully");
              loadPersonalFiles();
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete file. Please try again.");
            }
          },
        },
      ]
    );
  };

  // Load challenges the student has joined (Active and Completed)
  const loadMyChallenges = async () => {
    try {
      setLoadingChallenges(true);
      
      // Load active challenges
      const activeResponse = await api("/api/challenges/me", {
        method: "GET",
        auth: true,
        params: { status: "active" },
      });
      setActiveChallenges(activeResponse || []);
      
      // Load completed challenges
      const completedResponse = await api("/api/challenges/me", {
        method: "GET",
        auth: true,
        params: { status: "completed" },
      });
      setCompletedChallenges(completedResponse || []);
    } catch (error: any) {
      console.error("Error loading my challenges:", error);
      setActiveChallenges([]);
      setCompletedChallenges([]);
    } finally {
      setLoadingChallenges(false);
    }
  };

  // Load discoverable challenges (not yet joined)
  const loadDiscoverChallenges = async () => {
    try {
      setLoadingChallenges(true);
      const response = await api("/api/challenges", {
        method: "GET",
        auth: true,
        params: { status: "active" },
      });
      
      // Filter out challenges the student has already joined
      const discover = (response || []).filter((c: Challenge) => !c.isJoined);
      setDiscoverChallenges(discover);
    } catch (error: any) {
      console.error("Error loading discover challenges:", error);
      setDiscoverChallenges([]);
    } finally {
      setLoadingChallenges(false);
    }
  };

  // Join a challenge
  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await api(`/api/challenges/${challengeId}/join`, {
        method: "POST",
        auth: true,
      });
      
      Alert.alert("Success", "You've joined the challenge!");
      // Reload challenges
      await loadMyChallenges();
      await loadDiscoverChallenges();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join challenge");
    }
  };

  // Leave a challenge
  const handleLeaveChallenge = async (challengeId: string) => {
    try {
      Alert.alert(
        "Leave Challenge",
        "Are you sure you want to leave this challenge?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Leave",
            style: "destructive",
            onPress: async () => {
              await api(`/api/challenges/${challengeId}/leave`, {
                method: "POST",
                auth: true,
              });
              Alert.alert("Success", "You've left the challenge");
              await loadMyChallenges();
              await loadDiscoverChallenges();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to leave challenge");
    }
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

  const handleDownload = async (resource: Resource) => {
    try {
      const url = resource.fileUrl || resource.externalUrl;
      if (!url) {
        Alert.alert("Error", "No file URL available");
        return;
      }
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this file");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open file");
    }
  };

  const handleShare = async (resource: Resource) => {
    try {
      const url = resource.fileUrl || resource.externalUrl;
      if (!url) {
        Alert.alert("Error", "No URL available to share");
        return;
      }
      await Share.share({
        message: `Check out this resource: ${resource.title}\n${url}`,
        title: resource.title,
      });
    } catch (error) {
      // User cancelled
    }
  };

  const toggleSave = (resourceId: string) => {
    setSavedResources((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  // Load assigned resources (from teacher)
  const loadAssignedResources = async () => {
    try {
      setLoadingAssigned(true);
      const response = await api("/api/resources/assigned", {
        method: "GET",
        auth: true,
      });
      setAssignedResources(response || []);
    } catch (error: any) {
      console.error("Error loading assigned resources:", error);
      setAssignedResources([]);
    } finally {
      setLoadingAssigned(false);
    }
  };


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
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{resource.level}</Text>
            </View>
            {resource.category ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{resource.category}</Text>
              </View>
            ) : null}
            {resource.fileSize > 0 ? (
              <Text style={styles.resourceSize}>
                {formatFileSize(resource.fileSize)}
              </Text>
            ) : null}
          </View>
          <Text style={styles.resourceBy}>
            By {resource.uploadedBy?.name || "Unknown"} •{" "}
            {formatDate(resource.createdAt)}
          </Text>
          {resource.assignmentNote && (
            <View style={styles.noteContainer}>
              <TouchableOpacity
                style={styles.noteHeader}
                onPress={() =>
                  setExpandedNotes((prev) => ({
                    ...prev,
                    [resource._id]: !prev[resource._id],
                  }))
                }
              >
                <View style={styles.noteHeaderLeft}>
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color="#FF6A5C"
                  />
                  <Text style={styles.noteHeaderText}>
                    Note from {resource.assignmentTeacher?.name || "your teacher"} regarding this assignment
                  </Text>
                </View>
                <Ionicons
                  name={expandedNotes[resource._id] ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>
              {expandedNotes[resource._id] ? (
                <View style={styles.noteContent}>
                  <Text style={styles.noteText}>{resource.assignmentNote}</Text>
                </View>
              ) : resource.assignmentNote.length > 100 ? (
                <Text style={styles.notePreview}>
                  {resource.assignmentNote.substring(0, 100)}...
                </Text>
              ) : (
                <Text style={styles.noteText}>{resource.assignmentNote}</Text>
              )}
            </View>
          )}
          <View style={styles.resourceActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDownload(resource)}
            >
              <Ionicons
                name="download-outline"
                size={16}
                color="#FF6A5C"
              />
              <Text style={styles.actionButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(resource)}
            >
              <Ionicons
                name="share-outline"
                size={16}
                color="#666"
              />
              <Text
                style={[styles.actionButtonText, { color: "#666" }]}
              >
                Share
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleSave(resource._id)}
            >
              <Ionicons
                name={savedResources.includes(resource._id) ? "bookmark" : "bookmark-outline"}
                size={16}
                color={savedResources.includes(resource._id) ? "#FF6A5C" : "#666"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderChallengeCard = (challenge: Challenge, showJoinButton: boolean = false) => (
    <Card key={challenge._id} style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>
            {challenge.description}
          </Text>
          {challenge.createdBy && (
            <Text style={styles.challengeCreator}>
              By {challenge.createdBy.name}
            </Text>
          )}
        </View>
        <Ionicons
          name={challenge.isCompleted ? "trophy" : "flag-outline"}
          size={20}
          color={challenge.isCompleted ? "#FFB800" : "#FF6A5C"}
        />
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
          <Text style={styles.metaText}>{challenge.participantCount || 0}</Text>
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

      {challenge.progress !== undefined && challenge.isJoined && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>{challenge.progress}%</Text>
          </View>
          <Progress value={challenge.progress} style={styles.progressBar} />
          {challenge.currentValue !== undefined && (
            <Text style={styles.progressDetail}>
              {challenge.currentValue} / {challenge.requirements?.target || 0}
            </Text>
          )}
        </View>
      )}

      {challenge.reward && (
        <View style={styles.rewardBox}>
          <Text style={styles.rewardText}>🎁 Reward: {challenge.reward}</Text>
        </View>
      )}

      {showJoinButton && !challenge.isJoined && (
        <Button
          onPress={() => handleJoinChallenge(challenge._id)}
          style={styles.joinButton}
        >
          <Text style={styles.joinButtonText}>Join Challenge</Text>
        </Button>
      )}

      {challenge.isJoined && !challenge.isCompleted && (
        <Button
          onPress={() => handleLeaveChallenge(challenge._id)}
          style={styles.leaveButton}
          variant="outline"
        >
          <Text style={styles.leaveButtonText}>Leave Challenge</Text>
        </Button>
      )}
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
          Your learning materials and challenges
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Tabs */}
        <Tabs defaultValue="assigned">
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="personal">My Personal Files</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>

          {/* Assigned Tab */}
          <TabsContent value="assigned">
            {loadingAssigned ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6A5C" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : assignedResources.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>No assigned resources</Text>
                <Text style={styles.emptySubtext}>
                  Resources assigned by your teacher will appear here
                </Text>
              </Card>
            ) : (
              assignedResources.map(renderResourceCard)
            )}
          </TabsContent>

          {/* My Personal Files Tab */}
          <TabsContent value="personal">
            <View style={styles.uploadButtonContainer}>
              <Button
                onPress={() => setShowUploadModal(true)}
                style={styles.uploadButton}
              >
                <Ionicons name="cloud-upload-outline" size={20} color="white" />
                <Text style={styles.uploadButtonText}>Upload File</Text>
              </Button>
            </View>

            {loadingPersonal ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6A5C" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : personalFiles.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="folder-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>No personal files</Text>
                <Text style={styles.emptySubtext}>
                  Upload files to build your personal library
                </Text>
              </Card>
            ) : (
              personalFiles.map((file) => (
                <Card key={file._id} style={styles.resourceCard}>
                  <View style={styles.resourceRow}>
                    <View style={styles.resourceIcon}>
                      {getIcon(file.fileType)}
                    </View>
                    <View style={styles.resourceInfo}>
                      <Text style={styles.resourceName}>{file.title}</Text>
                      {file.description ? (
                        <Text style={styles.resourceDescription}>
                          {file.description}
                        </Text>
                      ) : null}
                      <View style={styles.resourceMeta}>
                        {file.category ? (
                          <Badge variant="default" style={styles.categoryBadge}>
                            {file.category}
                          </Badge>
                        ) : null}
                        {file.instrument && file.instrument !== "Other" ? (
                          <Text style={styles.resourceInstrument}>
                            {file.instrument}
                          </Text>
                        ) : null}
                        {file.fileSize > 0 ? (
                          <Text style={styles.resourceSize}>
                            {formatFileSize(file.fileSize)}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={styles.resourceBy}>
                        Uploaded {formatDate(file.createdAt)}
                      </Text>
                      <View style={styles.resourceActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDownload(file)}
                        >
                          <Ionicons
                            name="download-outline"
                            size={16}
                            color="#FF6A5C"
                          />
                          <Text style={styles.actionButtonText}>Download</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleShare(file)}
                        >
                          <Ionicons
                            name="share-outline"
                            size={16}
                            color="#666"
                          />
                          <Text
                            style={[styles.actionButtonText, { color: "#666" }]}
                          >
                            Share
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => deletePersonalFile(file._id, file.title)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#DC2626"
                          />
                          <Text
                            style={[styles.actionButtonText, { color: "#DC2626" }]}
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <Tabs value={challengeSubtab} onValueChange={(v) => setChallengeSubtab(v as any)}>
              <TabsList style={styles.subTabsList}>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="discover">Discover</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              {/* Active Challenges */}
              <TabsContent value="active">
                {loadingChallenges ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6A5C" />
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                ) : activeChallenges.length === 0 ? (
                  <Card style={styles.emptyCard}>
                    <Ionicons name="flag-outline" size={48} color="#999" />
                    <Text style={styles.emptyText}>No active challenges</Text>
                    <Text style={styles.emptySubtext}>
                      Join challenges from the Discover tab to see them here
                    </Text>
                  </Card>
                ) : (
                  activeChallenges.map((c) => renderChallengeCard(c, false))
                )}
              </TabsContent>

              {/* Discover Challenges */}
              <TabsContent value="discover">
                {loadingChallenges ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6A5C" />
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                ) : discoverChallenges.length === 0 ? (
                  <Card style={styles.emptyCard}>
                    <Ionicons name="search-outline" size={48} color="#999" />
                    <Text style={styles.emptyText}>No challenges to discover</Text>
                    <Text style={styles.emptySubtext}>
                      New challenges will appear here when teachers create them
                    </Text>
                  </Card>
                ) : (
                  discoverChallenges.map((c) => renderChallengeCard(c, true))
                )}
              </TabsContent>

              {/* Completed Challenges */}
              <TabsContent value="completed">
                {loadingChallenges ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6A5C" />
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                ) : completedChallenges.length === 0 ? (
                  <Card style={styles.emptyCard}>
                    <Ionicons name="trophy-outline" size={48} color="#999" />
                    <Text style={styles.emptyText}>No completed challenges</Text>
                    <Text style={styles.emptySubtext}>
                      Challenges you complete will appear here
                    </Text>
                  </Card>
                ) : (
                  completedChallenges.map((c) => renderChallengeCard(c, false))
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
        onRequestClose={() => {
          setShowUploadModal(false);
          resetUploadForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Personal File</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>File Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., My Practice Sheet"
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

              <Text style={styles.label}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {TOPIC_CATEGORIES.filter(c => c !== "All").map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      category === cat && styles.chipActive,
                    ]}
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

              <Text style={styles.label}>Instrument (Optional)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {INSTRUMENT_OPTIONS.filter(i => i !== "All" && i !== "Music Theory").map((inst) => (
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

              <Text style={styles.label}>Level (Optional)</Text>
              <View style={styles.chipRow}>
                {LEVEL_OPTIONS.filter(l => l !== "All").map((lev) => (
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

              <Text style={styles.label}>Upload File or External URL</Text>
              {!selectedFile ? (
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
              ) : (
                <View style={styles.selectedFileContainer}>
                  <Ionicons name="document" size={20} color="#FF6A5C" />
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFile.name || "Selected file"}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <Ionicons name="close-circle" size={20} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                onPress={uploadPersonalFile}
                style={styles.submitButton}
                disabled={uploading || !title}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabsList: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  emptyCard: {
    padding: 40,
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
    alignSelf: "center",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#FF6A5C",
  },
  filterChipText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "white",
  },
  resourceCard: {
    marginBottom: 12,
    padding: 16,
  },
  resourceRow: {
    flexDirection: "row",
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  resourceMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: "#FF6A5C",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  levelBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryBadge: {
    backgroundColor: "#FF9076",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  categoryBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  resourceSize: {
    fontSize: 12,
    color: "#999",
  },
  resourceBy: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
  },
  resourceActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#FF6A5C",
    fontWeight: "500",
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
  challengeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
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
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6A5C",
  },
  progressBar: {
    height: 8,
  },
  rewardBox: {
    backgroundColor: "#FFF3C4",
    padding: 12,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  challengeCreator: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
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
  progressDetail: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  joinButton: {
    marginTop: 12,
    backgroundColor: "#FF6A5C",
  },
  joinButtonText: {
    color: "white",
    fontWeight: "600",
  },
  leaveButton: {
    marginTop: 12,
    borderColor: "#FF6A5C",
  },
  leaveButtonText: {
    color: "#FF6A5C",
    fontWeight: "600",
  },
  subTabsList: {
    marginBottom: 16,
  },
  noteContainer: {
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#FFF3C4",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF6A5C",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  noteHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF6A5C",
    flex: 1,
  },
  noteContent: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#FFE4B5",
  },
  noteText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  notePreview: {
    fontSize: 13,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  uploadButtonContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resourceInstrument: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
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
    flexWrap: "wrap",
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
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
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  selectedFileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFileName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
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
});
