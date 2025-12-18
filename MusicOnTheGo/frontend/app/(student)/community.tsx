import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Image,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "../../lib/api";
import { getStoredUser } from "../../lib/auth";

interface CommunityPost {
  _id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: "video" | "audio" | "image";
  thumbnailUrl?: string;
  instrument: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  author: {
    _id: string;
    name: string;
    profileImage?: string;
    role: "student" | "teacher";
  };
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  likes: Array<{ _id: string; name: string }>;
  comments: Array<{
    _id: string;
    author: {
      _id: string;
      name: string;
      profileImage?: string;
    };
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
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

export default function CommunityScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "students" | "teachers" | "myPosts">("all");
  const [selectedInstrument, setSelectedInstrument] = useState("All");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState("");

  // Post form state
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postInstrument, setPostInstrument] = useState("");
  const [postLevel, setPostLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [postMediaUrl, setPostMediaUrl] = useState("");
  const [postMediaType, setPostMediaType] = useState<"video" | "audio" | "image" | null>(null);
  const [selectedMediaFile, setSelectedMediaFile] = useState<any>(null);

  // Load user with React Query
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return await getStoredUser();
    },
  });

  // Posts query with infinite pagination
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["community-posts", activeTab, selectedInstrument],
    queryFn: async ({ pageParam = 1 }) => {
      const filter = activeTab === "myPosts" ? "me" : activeTab;
      const endpoint = activeTab === "myPosts" ? "/api/community/me" : "/api/community";
      
      const params: Record<string, string> = {
        page: pageParam.toString(),
        limit: "20",
      };
      if (activeTab !== "myPosts" && filter !== "me") {
        params.filter = filter;
      }
      if (selectedInstrument !== "All") {
        params.instrument = selectedInstrument;
      }

      const response = await api(endpoint, {
        method: "GET",
        auth: true,
        params,
      });

      const postsData = response.posts || response || [];
      const pagination = response.pagination;

      return {
        posts: postsData,
        pagination: pagination || { hasMore: postsData.length >= 20 },
        nextPage: pagination?.hasMore ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  // Flatten all pages into a single array
  const posts = useMemo(() => {
    return postsData?.pages.flatMap((page) => page.posts) || [];
  }, [postsData]);

  const loadMorePosts = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Like mutation with optimistic updates
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await api(`/api/community/${postId}/like`, {
        method: "POST",
        auth: true,
      });
    },
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["community-posts", activeTab, selectedInstrument] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(["community-posts", activeTab, selectedInstrument]);

      // Optimistically update
      queryClient.setQueryData(["community-posts", activeTab, selectedInstrument], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: CommunityPost) =>
              post._id === postId
                ? {
                    ...post,
                    isLiked: !post.isLiked,
                    likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
                  }
                : post
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["community-posts", activeTab, selectedInstrument], context.previousData);
      }
      Alert.alert("Error", "Failed to like post. Please try again.");
    },
    onSuccess: (response, postId) => {
      // Update with server response
      queryClient.setQueryData(["community-posts", activeTab, selectedInstrument], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: CommunityPost) =>
              post._id === postId
                ? {
                    ...post,
                    isLiked: response.isLiked,
                    likeCount: response.likeCount,
                    likes: response.likes || post.likes,
                  }
                : post
            ),
          })),
        };
      });
    },
  });

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      return await api(`/api/community/${postId}/comment`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({ text }),
      });
    },
    onSuccess: (response, variables) => {
      // Update the post in the query cache
      queryClient.setQueryData(["community-posts", activeTab, selectedInstrument], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: CommunityPost) =>
              post._id === variables.postId ? response : post
            ),
          })),
        };
      });
      setCommentText("");
      setSelectedPost(response);
    },
    onError: () => {
      Alert.alert("Error", "Failed to add comment. Please try again.");
    },
  });

  const handleAddComment = () => {
    if (!selectedPost || !commentText.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    const trimmedText = commentText.trim();
    commentMutation.mutate({ postId: selectedPost._id, text: trimmedText });
  };

  const pickMedia = async (type: "video" | "audio" | "image") => {
    try {
      if (type === "video") {
        // Request permissions first
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please grant access to your media library to select videos."
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          quality: 1,
          videoMaxDuration: 3600, // Allow up to 1 hour of video
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          // Store both the URI (for display) and the file object (for upload)
          setPostMediaUrl(asset.uri);
          setPostMediaType("video");
          setSelectedMediaFile({
            uri: asset.uri,
            type: asset.mimeType || "video/mp4",
            name: asset.fileName || asset.uri.split("/").pop() || "video.mp4",
          });
        }
      } else if (type === "image") {
        // Use DocumentPicker to allow both images and PDFs (for music sheets)
        // This allows users to upload long music sheets without cropping
        const result = await DocumentPicker.getDocumentAsync({
          type: ["image/*", "application/pdf"],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          setPostMediaUrl(asset.uri);
          setPostMediaType("image");
          setSelectedMediaFile({
            uri: asset.uri,
            type: asset.mimeType || (asset.name?.endsWith('.pdf') ? "application/pdf" : "image/jpeg"),
            name: asset.name || asset.uri.split("/").pop() || "file",
          });
        }
      } else {
        // Audio
        const result = await DocumentPicker.getDocumentAsync({
          type: ["audio/*"],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          setPostMediaUrl(asset.uri);
          setPostMediaType("audio");
          setSelectedMediaFile({
            uri: asset.uri,
            type: asset.mimeType || "audio/mpeg",
            name: asset.name || asset.uri.split("/").pop() || "audio.mp3",
          });
        }
      }
    } catch (error: any) {
      console.error("Error picking media:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to pick media file. Please try again."
      );
    }
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!postTitle || !postInstrument || !postMediaType) {
        throw new Error("Please fill in all required fields (Title, Instrument, and Media)");
      }

      if (!selectedMediaFile) {
        throw new Error("Please select a media file (video or audio)");
      }

      // Step 1: Upload media to Cloudinary first
      const formData = new FormData();
      formData.append("file", {
        uri: selectedMediaFile.uri,
        type: selectedMediaFile.type,
        name: selectedMediaFile.name,
      } as any);

      const uploadResponse = await api("/api/uploads/resource-file", {
        method: "POST",
        auth: true,
        body: formData,
      });

      if (!uploadResponse || !uploadResponse.url) {
        throw new Error("Upload failed: No URL returned from server");
      }

      const mediaUrl = uploadResponse.url;
      let thumbnailUrl = "";

      // For videos, try to get thumbnail from Cloudinary (if available)
      // For images, use the image URL as thumbnail
      if (postMediaType === "video" && mediaUrl) {
        thumbnailUrl = mediaUrl.replace(/\.(mp4|mov|avi|webm)$/i, ".jpg");
      } else if (postMediaType === "image" && mediaUrl) {
        thumbnailUrl = mediaUrl; // Use image URL as thumbnail
      }

      // Step 2: Create the post with the Cloudinary URL
      const postData = {
        title: postTitle.trim(),
        description: (postDescription || "").trim(),
        mediaUrl: mediaUrl.trim(),
        mediaType: postMediaType,
        thumbnailUrl: thumbnailUrl.trim(),
        instrument: postInstrument.trim(),
        level: postLevel,
        visibility: "public",
      };

      if (!postData.title || !postData.mediaUrl || !postData.mediaType || !postData.instrument) {
        throw new Error("Missing required fields: title, mediaUrl, mediaType, or instrument");
      }

      return await api("/api/community", {
        method: "POST",
        auth: true,
        body: JSON.stringify(postData),
      });
    },
    onSuccess: () => {
      Alert.alert("Success", "Post created successfully!");
      resetPostForm();
      setShowPostModal(false);
      // Invalidate and refetch posts to show the new post
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      refetch();
    },
    onError: (error: any) => {
      console.error("Post creation error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to create post. Please try again."
      );
    },
  });

  const uploadPost = () => {
    // Client-side validation with helpful messages
    if (!postTitle || !postTitle.trim()) {
      Alert.alert("Missing Field", "Please enter a title for your post.");
      return;
    }
    if (!postInstrument || postInstrument.trim() === "") {
      Alert.alert("Missing Field", "Please select an instrument.");
      return;
    }
    if (!postMediaType) {
      Alert.alert("Missing Field", "Please select a media type (Video, Audio, or Image).");
      return;
    }
    if (!selectedMediaFile) {
      Alert.alert("Missing Media", "Please select a media file to upload.");
      return;
    }
    
    createPostMutation.mutate();
  };

  const resetPostForm = () => {
    setPostTitle("");
    setPostDescription("");
    setPostInstrument("");
    setPostLevel("Beginner");
    setPostMediaUrl("");
    setPostMediaType(null);
    setSelectedMediaFile(null);
  };

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: CommunityPost) => item._id, []);

  // Get item layout for better FlatList performance (approximate post height: 500px)
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 500,
      offset: 500 * index,
      index,
    }),
    []
  );

  // Empty components for FlatList
  const renderEmptyAll = useCallback(
    () => (
      <Card style={styles.emptyCard}>
        <Ionicons name="people-outline" size={48} color="#999" />
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubtext}>Be the first to share your music!</Text>
      </Card>
    ),
    []
  );

  const renderEmptyStudents = useCallback(
    () => (
      <Card style={styles.emptyCard}>
        <Ionicons name="school-outline" size={48} color="#999" />
        <Text style={styles.emptyText}>No student posts</Text>
        <Text style={styles.emptySubtext}>Students haven't shared anything yet</Text>
      </Card>
    ),
    []
  );

  const renderEmptyTeachers = useCallback(
    () => (
      <Card style={styles.emptyCard}>
        <Ionicons name="person-outline" size={48} color="#999" />
        <Text style={styles.emptyText}>No teacher posts</Text>
        <Text style={styles.emptySubtext}>Teachers haven't shared anything yet</Text>
      </Card>
    ),
    []
  );

  const renderEmptyMyPosts = useCallback(
    () => (
      <Card style={styles.emptyCard}>
        <Ionicons name="add-circle-outline" size={48} color="#999" />
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubtext}>Share your music with the community!</Text>
      </Card>
    ),
    []
  );

  // List header component with filters and tabs
  const renderListHeader = useCallback(
    () => (
      <>
        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {INSTRUMENT_OPTIONS.map((inst) => (
            <TouchableOpacity
              key={inst}
              style={[
                styles.filterChip,
                selectedInstrument === inst && styles.filterChipActive,
              ]}
              onPress={() => setSelectedInstrument(inst)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedInstrument === inst && styles.filterChipTextActive,
                ]}
              >
                {inst}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "all" | "students" | "teachers" | "myPosts")}>
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="myPosts">My Posts</TabsTrigger>
          </TabsList>
        </Tabs>
      </>
    ),
    [activeTab, selectedInstrument]
  );

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  // Memoized render function for FlatList performance
  const renderPost = useCallback(({ item: post }: { item: CommunityPost }) => (
    <Card key={post._id} style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          {post.author.profileImage ? (
            <Image
              source={{ uri: post.author.profileImage }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {post.author.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.authorName}>{post.author.name}</Text>
            <Text style={styles.authorRole}>
              {post.author.role === "student" ? "Student" : "Teacher"}
            </Text>
          </View>
        </View>
        <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
      </View>

      {/* Post Content */}
      <Text style={styles.postTitle}>{post.title}</Text>
      {post.description ? (
        <Text style={styles.postDescription}>{post.description}</Text>
      ) : null}

      {/* Media Preview */}
      <View style={styles.mediaContainer}>
        {post.mediaType === "image" ? (
          post.mediaUrl.toLowerCase().endsWith('.pdf') ? (
            <TouchableOpacity
              style={styles.pdfContainer}
              onPress={() => Linking.openURL(post.mediaUrl)}
            >
              <Ionicons name="document-text" size={48} color="#FF6A5C" />
              <Text style={styles.pdfText}>Tap to view PDF</Text>
              <Text style={styles.pdfSubtext}>Music Sheet</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => Linking.openURL(post.mediaUrl)}
            >
              <Image
                source={{ uri: post.mediaUrl }}
                style={styles.postImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )
        ) : post.mediaType === "video" ? (
          <TouchableOpacity
            style={styles.videoThumbnail}
            onPress={() => Linking.openURL(post.mediaUrl)}
          >
            {post.thumbnailUrl ? (
              <Image source={{ uri: post.thumbnailUrl }} style={styles.thumbnail} />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Ionicons name="play-circle" size={48} color="#FF6A5C" />
              </View>
            )}
            <View style={styles.playOverlay}>
              <Ionicons name="play" size={32} color="white" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.audioContainer}
            onPress={() => Linking.openURL(post.mediaUrl)}
          >
            <Ionicons name="musical-notes" size={32} color="#FF6A5C" />
            <Text style={styles.audioText}>Tap to play audio</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Post Meta */}
      <View style={styles.postMeta}>
        <View style={[styles.levelBadge, { backgroundColor: "#FF6A5C" }]}>
          <Text style={styles.levelBadgeText}>{post.level}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: "#FF9076" }]}>
          <Text style={styles.categoryBadgeText}>{post.instrument}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(post._id)}
        >
          <Ionicons
            name={post.isLiked ? "heart" : "heart-outline"}
            size={20}
            color={post.isLiked ? "#FF6A5C" : "#666"}
          />
          <Text
            style={[
              styles.actionText,
              post.isLiked && styles.actionTextLiked,
            ]}
          >
            {post.likeCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedPost(post);
            setShowCommentsModal(true);
          }}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{post.commentCount}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  ), []);

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
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>
          Share your music and connect with others
        </Text>
      </LinearGradient>

      {/* Filter Chips and Tabs - Fixed Header */}
      <View style={styles.fixedHeader}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {INSTRUMENT_OPTIONS.map((inst) => (
            <TouchableOpacity
              key={inst}
              style={[
                styles.filterChip,
                selectedInstrument === inst && styles.filterChipActive,
              ]}
              onPress={() => setSelectedInstrument(inst)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedInstrument === inst && styles.filterChipTextActive,
                ]}
              >
                {inst}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "all" | "students" | "teachers" | "myPosts")}>
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="myPosts">My Posts</TabsTrigger>
          </TabsList>
        </Tabs>
      </View>

      {/* Optimized FlatList for Posts */}
      {isFetching && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6A5C" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          style={styles.content}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          // Pagination
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          // Loading more indicator
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#FF6A5C" />
                <Text style={styles.loadingMoreText}>Loading more posts...</Text>
              </View>
            ) : null
          }
          // Empty state
          ListEmptyComponent={
            activeTab === "all"
              ? renderEmptyAll
              : activeTab === "students"
              ? renderEmptyStudents
              : activeTab === "teachers"
              ? renderEmptyTeachers
              : renderEmptyMyPosts
          }
        />
      )}

      {/* Create Post Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowPostModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowPostModal(false);
          resetPostForm();
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPostModal(false);
                  resetPostForm();
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., My Piano Performance"
                value={postTitle}
                onChangeText={setPostTitle}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about your performance..."
                value={postDescription}
                onChangeText={setPostDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Instrument *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {INSTRUMENT_OPTIONS.filter((i) => i !== "All").map((inst) => (
                  <TouchableOpacity
                    key={inst}
                    style={[
                      styles.chip,
                      postInstrument === inst && styles.chipActive,
                    ]}
                    onPress={() => setPostInstrument(inst)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        postInstrument === inst && styles.chipTextActive,
                      ]}
                    >
                      {inst}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Level *</Text>
              <View style={styles.chipScroll}>
                {LEVEL_OPTIONS.filter((l) => l !== "All").map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.chip,
                      postLevel === level && styles.chipActive,
                    ]}
                    onPress={() => setPostLevel(level as any)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        postLevel === level && styles.chipTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Media *</Text>
              <View style={styles.mediaButtons}>
                <Button
                  onPress={() => pickMedia("video")}
                  style={styles.mediaButton}
                  variant="outline"
                >
                  <Ionicons name="videocam-outline" size={20} color="#FF6A5C" />
                  <Text style={styles.mediaButtonText}>Video</Text>
                </Button>
                <Button
                  onPress={() => pickMedia("audio")}
                  style={styles.mediaButton}
                  variant="outline"
                >
                  <Ionicons name="musical-notes-outline" size={20} color="#FF6A5C" />
                  <Text style={styles.mediaButtonText}>Audio</Text>
                </Button>
                <Button
                  onPress={() => pickMedia("image")}
                  style={styles.mediaButton}
                  variant="outline"
                >
                  <Ionicons name="image-outline" size={20} color="#FF6A5C" />
                  <Text style={styles.mediaButtonText}>Image</Text>
                </Button>
              </View>
              <Text style={styles.fileSizeHint}>
                Maximum file size: 1GB (for videos/audio), 20MB (for images/PDFs). PDFs are great for music sheets!
              </Text>

              {postMediaUrl ? (
                <View style={styles.selectedMedia}>
                  <Ionicons
                    name={
                      postMediaType === "video"
                        ? "videocam"
                        : postMediaType === "audio"
                        ? "musical-notes"
                        : "image"
                    }
                    size={20}
                    color="#10B981"
                  />
                  <Text style={styles.selectedMediaText}>
                    {postMediaType === "video"
                      ? "Video"
                      : postMediaType === "audio"
                      ? "Audio"
                      : "Image"}{" "}
                    selected
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                onPress={uploadPost}
                style={styles.submitButton}
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Post</Text>
                )}
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCommentsModal(false);
          setCommentText("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCommentsModal(false);
                  setCommentText("");
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              contentContainerStyle={styles.commentsScrollContent}
            >
              {selectedPost?.comments.length === 0 ? (
                <Text style={styles.noCommentsText}>No comments yet</Text>
              ) : (
                selectedPost?.comments.map((comment) => (
                  <View key={comment._id} style={styles.commentItem}>
                    <View style={styles.commentAuthor}>
                      {comment.author.profileImage ? (
                        <Image
                          source={{ uri: comment.author.profileImage }}
                          style={styles.commentAvatar}
                        />
                      ) : (
                        <View style={styles.commentAvatarPlaceholder}>
                          <Text style={styles.commentAvatarText}>
                            {comment.author.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View>
                        <Text style={styles.commentAuthorName}>
                          {comment.author.name}
                        </Text>
                        <Text style={styles.commentDate}>
                          {formatDate(comment.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={commentText.trim() ? "#FF6A5C" : "#999"}
                />
              </TouchableOpacity>
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
    backgroundColor: "#FFF5F3",
  },
  fixedHeader: {
    backgroundColor: "#FFF5F3",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100, // Space for floating button
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  filterChipActive: {
    backgroundColor: "#FF6A5C",
    borderColor: "#FF6A5C",
  },
  filterChipText: {
    fontSize: 14,
    color: "#666",
  },
  filterChipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  tabsList: {
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  emptyCard: {
    padding: 40,
    alignItems: "center",
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
  postCard: {
    marginBottom: 16,
    padding: 16,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6A5C",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  authorRole: {
    fontSize: 12,
    color: "#666",
  },
  postDate: {
    fontSize: 12,
    color: "#999",
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  mediaContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  videoThumbnail: {
    width: "100%",
    height: 200,
    backgroundColor: "#000",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  playOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    gap: 12,
  },
  audioText: {
    fontSize: 14,
    color: "#666",
  },
  imageContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  postImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
  },
  postMeta: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  postActions: {
    flexDirection: "row",
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: "#666",
  },
  actionTextLiked: {
    color: "#FF6A5C",
    fontWeight: "600",
  },
  createButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF6A5C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
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
    flex: 1,
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
    fontWeight: "600",
    color: "#333",
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 20,
    paddingBottom: 100,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  chipScroll: {
    flexDirection: "row",
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F9F9F9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  chipActive: {
    backgroundColor: "#FF6A5C",
    borderColor: "#FF6A5C",
  },
  chipText: {
    fontSize: 14,
    color: "#666",
  },
  chipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  mediaButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  mediaButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mediaButtonText: {
    color: "#FF6A5C",
    fontWeight: "600",
  },
  fileSizeHint: {
    fontSize: 12,
    color: "#666",
    marginTop: -8,
    marginBottom: 12,
    fontStyle: "italic",
  },
  selectedMedia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#D6FFE1",
    borderRadius: 8,
  },
  selectedMediaText: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  submitButton: {
    backgroundColor: "#FF6A5C",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
  },
  commentsScrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  commentItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  commentAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6A5C",
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  commentDate: {
    fontSize: 12,
    color: "#999",
  },
  commentText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginLeft: 52, // Align with author info (avatar width 40 + gap 12)
    paddingRight: 4,
  },
  noCommentsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    padding: 20,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
});

