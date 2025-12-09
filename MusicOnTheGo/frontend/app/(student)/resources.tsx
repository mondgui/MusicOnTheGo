import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Resource {
  id: number;
  name: string;
  type: "pdf" | "audio" | "video" | "sheet";
  uploadedBy: string;
  uploadDate: string;
  size: string;
  category: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  participants: number;
  deadline: string;
  reward: string;
  progress?: number;
  isJoined?: boolean;
}

export default function ResourcesScreen() {
  const router = useRouter();

  const [resources, setResources] = useState<Resource[]>([
    {
      id: 1,
      name: "C Major Scale Practice Sheet",
      type: "pdf",
      uploadedBy: "Sarah Mitchell",
      uploadDate: "2025-11-28",
      size: "245 KB",
      category: "Scales",
    },
    {
      id: 2,
      name: "Fur Elise - Sheet Music",
      type: "sheet",
      uploadedBy: "Sarah Mitchell",
      uploadDate: "2025-11-25",
      size: "1.2 MB",
      category: "Classical",
    },
    {
      id: 3,
      name: "Practice Session Recording",
      type: "audio",
      uploadedBy: "You",
      uploadDate: "2025-12-01",
      size: "3.4 MB",
      category: "Recordings",
    },
    {
      id: 4,
      name: "Technique Tutorial - Finger Position",
      type: "video",
      uploadedBy: "Sarah Mitchell",
      uploadDate: "2025-11-20",
      size: "15.2 MB",
      category: "Tutorials",
    },
    {
      id: 5,
      name: "Jazz Chord Progressions",
      type: "pdf",
      uploadedBy: "Sarah Mitchell",
      uploadDate: "2025-11-15",
      size: "890 KB",
      category: "Theory",
    },
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 1,
      title: "December Practice Marathon",
      description: "Practice for at least 30 minutes every day this month",
      difficulty: "Intermediate",
      participants: 156,
      deadline: "2025-12-31",
      reward: "🏆 Practice Champion Badge",
      progress: 45,
      isJoined: true,
    },
    {
      id: 2,
      title: "Master 5 New Scales",
      description: "Learn and record yourself playing 5 different scales perfectly",
      difficulty: "Beginner",
      participants: 89,
      deadline: "2025-12-20",
      reward: "🎵 Scale Master Badge",
      progress: 60,
      isJoined: true,
    },
    {
      id: 3,
      title: "Holiday Recital Ready",
      description: "Prepare and perform a complete holiday piece",
      difficulty: "Advanced",
      participants: 234,
      deadline: "2025-12-24",
      reward: "🎄 Holiday Star Badge + Feature",
      isJoined: false,
    },
    {
      id: 4,
      title: "Theory Quiz Champion",
      description: "Score 100% on all theory quizzes this month",
      difficulty: "Intermediate",
      participants: 67,
      deadline: "2025-12-31",
      reward: "🧠 Theory Genius Badge",
      isJoined: false,
    },
  ]);


  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "sheet":
        return <Ionicons name="document-text" size={20} color="#DC2626" />;
      case "audio":
        return <Ionicons name="musical-notes" size={20} color="#FF6A5C" />;
      case "video":
        return <Ionicons name="videocam" size={20} color="#2563EB" />;
      default:
        return <Ionicons name="document" size={20} color="#666" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "success";
      case "Intermediate":
        return "warning";
      case "Advanced":
        return "default";
      default:
        return "secondary";
    }
  };


  const handleDelete = (id: number) => {
    setResources(resources.filter((r) => r.id !== id));
    Alert.alert("Success", "Resource deleted");
  };

  const handleJoinChallenge = (challengeId: number) => {
    setChallenges(
      challenges.map((c) =>
        c.id === challengeId
          ? { ...c, isJoined: true, participants: c.participants + 1, progress: 0 }
          : c
      )
    );
    Alert.alert("Success", "Challenge joined! Good luck! 🎯");
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const sharedResources = resources.filter((r) => r.uploadedBy !== "You");
  const myResources = resources.filter((r) => r.uploadedBy === "You");
  const myChallenges = challenges.filter((c) => c.isJoined);
  const availableChallenges = challenges.filter((c) => !c.isJoined);

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
        <Text style={styles.headerTitle}>Learning Hub</Text>
        <Text style={styles.headerSubtitle}>
          Resources, challenges & community
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Tabs */}
        <Tabs defaultValue="resources">
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Tabs defaultValue="all">
              <TabsList style={styles.nestedTabsList}>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="shared">From Teacher</TabsTrigger>
                <TabsTrigger value="mine">My Files</TabsTrigger>
              </TabsList>

              {/* All Resources */}
              <TabsContent value="all">
                {resources.map((resource) => (
                  <Card key={resource.id} style={styles.resourceCard}>
                    <View style={styles.resourceRow}>
                      <View style={styles.resourceIcon}>
                        {getIcon(resource.type)}
                      </View>
                      <View style={styles.resourceInfo}>
                        <Text style={styles.resourceName}>{resource.name}</Text>
                        <View style={styles.resourceMeta}>
                          <Badge variant="default" style={styles.categoryBadge}>
                            {resource.category}
                          </Badge>
                          <Text style={styles.resourceSize}>{resource.size}</Text>
                        </View>
                        <Text style={styles.resourceBy}>
                          By {resource.uploadedBy} • {formatDate(resource.uploadDate)}
                        </Text>
                        <View style={styles.resourceActions}>
                          <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="download-outline" size={16} color="#FF6A5C" />
                            <Text style={styles.actionButtonText}>Download</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="share-outline" size={16} color="#666" />
                            <Text style={[styles.actionButtonText, { color: "#666" }]}>
                              Share
                            </Text>
                          </TouchableOpacity>
                          {resource.uploadedBy === "You" && (
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleDelete(resource.id)}
                            >
                              <Ionicons name="trash-outline" size={16} color="#DC2626" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}
              </TabsContent>

              {/* Shared Resources */}
              <TabsContent value="shared">
                {sharedResources.length === 0 ? (
                  <Card style={styles.emptyCard}>
                    <Ionicons name="document-text" size={48} color="#999" />
                    <Text style={styles.emptyText}>No shared resources yet</Text>
                  </Card>
                ) : (
                  sharedResources.map((resource) => (
                    <Card key={resource.id} style={styles.resourceCard}>
                      <View style={styles.resourceRow}>
                        <View style={styles.resourceIcon}>
                          {getIcon(resource.type)}
                        </View>
                        <View style={styles.resourceInfo}>
                          <Text style={styles.resourceName}>{resource.name}</Text>
                          <View style={styles.resourceMeta}>
                            <Badge variant="default" style={styles.categoryBadge}>
                              {resource.category}
                            </Badge>
                            <Text style={styles.resourceSize}>{resource.size}</Text>
                          </View>
                          <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="download-outline" size={16} color="#FF6A5C" />
                            <Text style={styles.actionButtonText}>Download</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* My Resources */}
              <TabsContent value="mine">
                {myResources.length === 0 ? (
                  <Card style={styles.emptyCard}>
                    <Ionicons name="cloud-upload-outline" size={48} color="#999" />
                    <Text style={styles.emptyText}>No uploaded files yet</Text>
                    <Text style={styles.emptySubtext}>
                      Upload your first resource to get started
                    </Text>
                  </Card>
                ) : (
                  myResources.map((resource) => (
                    <Card key={resource.id} style={styles.resourceCard}>
                      <View style={styles.resourceRow}>
                        <View style={styles.resourceIcon}>
                          {getIcon(resource.type)}
                        </View>
                        <View style={styles.resourceInfo}>
                          <Text style={styles.resourceName}>{resource.name}</Text>
                          <View style={styles.resourceMeta}>
                            <Badge variant="default" style={styles.categoryBadge}>
                              {resource.category}
                            </Badge>
                            <Text style={styles.resourceSize}>{resource.size}</Text>
                          </View>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDelete(resource.id)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                            <Text style={[styles.actionButtonText, { color: "#DC2626" }]}>
                              Delete
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <Tabs defaultValue="my">
              <TabsList style={styles.nestedTabsList}>
                <TabsTrigger value="my">My Challenges</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
              </TabsList>

              {/* My Challenges */}
              <TabsContent value="my">
                {myChallenges.length === 0 ? (
                  <Card style={styles.emptyCard}>
                    <Ionicons name="trophy-outline" size={48} color="#999" />
                    <Text style={styles.emptyText}>No active challenges</Text>
                    <Text style={styles.emptySubtext}>
                      Join a challenge to stay motivated!
                    </Text>
                  </Card>
                ) : (
                  myChallenges.map((challenge) => (
                    <Card key={challenge.id} style={styles.challengeCard}>
                      <View style={styles.challengeHeader}>
                        <View style={styles.challengeInfo}>
                          <Text style={styles.challengeTitle}>{challenge.title}</Text>
                          <Text style={styles.challengeDescription}>
                            {challenge.description}
                          </Text>
                        </View>
                        <Ionicons name="trophy" size={20} color="#FFB800" />
                      </View>

                      <View style={styles.challengeMeta}>
                        <Badge variant={getDifficultyColor(challenge.difficulty) as any}>
                          {challenge.difficulty}
                        </Badge>
                        <View style={styles.metaItem}>
                          <Ionicons name="people-outline" size={14} color="#666" />
                          <Text style={styles.metaText}>{challenge.participants}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="calendar-outline" size={14} color="#666" />
                          <Text style={styles.metaText}>
                            {formatDate(challenge.deadline)}
                          </Text>
                        </View>
                      </View>

                      {challenge.progress !== undefined && (
                        <View style={styles.progressSection}>
                          <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Progress</Text>
                            <Text style={styles.progressPercent}>
                              {challenge.progress}%
                            </Text>
                          </View>
                          <Progress value={challenge.progress} style={styles.progressBar} />
                        </View>
                      )}

                      <View style={styles.rewardBox}>
                        <Text style={styles.rewardText}>
                          🎁 Reward: {challenge.reward}
                        </Text>
                      </View>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Available Challenges */}
              <TabsContent value="available">
                {availableChallenges.map((challenge) => (
                  <Card key={challenge.id} style={styles.challengeCard}>
                    <View style={styles.challengeHeader}>
                      <View style={styles.challengeInfo}>
                        <Text style={styles.challengeTitle}>{challenge.title}</Text>
                        <Text style={styles.challengeDescription}>
                          {challenge.description}
                        </Text>
                      </View>
                      <Ionicons name="flag-outline" size={20} color="#FF6A5C" />
                    </View>

                    <View style={styles.challengeMeta}>
                      <Badge variant={getDifficultyColor(challenge.difficulty) as any}>
                        {challenge.difficulty}
                      </Badge>
                      <View style={styles.metaItem}>
                        <Ionicons name="people-outline" size={14} color="#666" />
                        <Text style={styles.metaText}>{challenge.participants}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={14} color="#666" />
                        <Text style={styles.metaText}>
                          {formatDate(challenge.deadline)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.rewardBox}>
                      <Text style={styles.rewardText}>
                        🎁 Reward: {challenge.reward}
                      </Text>
                    </View>

                    <Button
                      onPress={() => handleJoinChallenge(challenge.id)}
                      style={styles.joinButton}
                      size="sm"
                    >
                      <Ionicons name="add" size={16} color="white" />
                      <Text style={styles.joinButtonText}>Join Challenge</Text>
                    </Button>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
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
  nestedTabsList: {
    marginBottom: 16,
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
    marginBottom: 8,
  },
  resourceMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
  },
  resourceSize: {
    fontSize: 12,
    color: "#666",
  },
  resourceBy: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  resourceActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE0D6",
    backgroundColor: "transparent",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6A5C",
  },
  deleteButton: {
    borderColor: "#FCA5A5",
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
  },
  emptySubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
  challengeCard: {
    padding: 16,
    marginBottom: 12,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "700",
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
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#666",
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF6A5C",
  },
  progressBar: {
    marginBottom: 0,
  },
  rewardBox: {
    backgroundColor: "#FFE0D6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  rewardText: {
    fontSize: 12,
    color: "#7F1D1D",
    textAlign: "center",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  joinButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

