import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { initSocket, getSocket } from "../../../lib/socket";
import type { Socket } from "socket.io-client";

type Teacher = {
  _id: string;
  name: string;
  email: string;
  instruments: string[];
  experience: string;
  location: string;
  rate?: number;
  about?: string;
  profileImage?: string;
  specialties?: string[];
  averageRating?: number | null;
  reviewCount?: number;
};

type Review = {
  _id: string;
  teacher: string;
  student: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
};

type AvailabilitySlot = {
  day: string; // Display format: "Wednesday, December 10, 2025"
  timeRange: string;
  isoDate?: string; // ISO format: "2025-12-10" for parsing
};

export default function TeacherProfileScreen() {
  const params = useLocalSearchParams();
  const teacherId = Array.isArray(params.id) ? params.id[0] : params.id || "";
  const router = useRouter();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [hasConversation, setHasConversation] = useState(false);
  const [checkingConversation, setCheckingConversation] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasBooking, setHasBooking] = useState(false);

  // Check if conversation exists with this teacher
  const checkConversation = useCallback(async () => {
    if (!teacherId) return;
    try {
      setCheckingConversation(true);
      const messages = await api(`/api/messages/conversation/${teacherId}`, { auth: true });
      // If there are any messages, a conversation exists
      setHasConversation(Array.isArray(messages) && messages.length > 0);
    } catch (err: any) {
      // If error or no messages, no conversation exists
      setHasConversation(false);
    } finally {
      setCheckingConversation(false);
    }
  }, [teacherId]);

  // Check if student has a booking with this teacher (required to leave a review)
  const checkBooking = useCallback(async () => {
    if (!teacherId) return;
    try {
      const bookings = await api("/api/bookings/student/me", { auth: true });
      const bookingsArray = bookings?.bookings || bookings || [];
      const hasBookingWithTeacher = bookingsArray.some((booking: any) => {
        const bookingTeacherId = booking.teacher?._id || booking.teacher;
        return String(bookingTeacherId) === String(teacherId) && booking.status === "approved";
      });
      setHasBooking(hasBookingWithTeacher);
    } catch (err: any) {
      setHasBooking(false);
    }
  }, [teacherId]);

  // Load reviews for this teacher
  const loadReviews = useCallback(async () => {
    if (!teacherId) return;
    try {
      setLoadingReviews(true);
      const response = await api(`/api/reviews/teacher/${teacherId}`);
      setReviews(response?.reviews || response || []);
    } catch (err: any) {
      console.log("Failed to load reviews:", err.message);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [teacherId]);

  // Load student's own review for this teacher
  const loadMyReview = useCallback(async () => {
    if (!teacherId) return;
    try {
      const review = await api(`/api/reviews/teacher/${teacherId}/me`, { auth: true });
      setMyReview(review);
      if (review) {
        setReviewRating(review.rating);
        setReviewComment(review.comment || "");
      }
    } catch (err: any) {
      // No review exists yet
      setMyReview(null);
      setReviewRating(5);
      setReviewComment("");
    }
  }, [teacherId]);

  // Fetch teacher data
  const fetchTeacher = useCallback(async () => {
    if (!teacherId) return;
    try {
      const data = await api(`/api/teachers/${teacherId}`);
      setTeacher(data);
    } catch (err: any) {
      console.log("Teacher fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  // Submit or update review
  const handleSubmitReview = async () => {
    if (!teacherId) {
      alert("Teacher ID is missing. Please try again.");
      return;
    }
    try {
      setSubmittingReview(true);
      console.log("[Review] Submitting review:", {
        teacherId,
        rating: reviewRating,
        commentLength: reviewComment.trim().length,
      });
      
      const response = await api("/api/reviews", {
        method: "POST",
        auth: true,
        body: {
          teacherId: String(teacherId),
          rating: reviewRating,
          comment: reviewComment.trim(),
        },
      });
      
      console.log("[Review] Review submitted successfully:", response);
      setMyReview(response);
      setShowReviewDialog(false);
      // Reload reviews and teacher data to update ratings
      await loadReviews();
      await fetchTeacher();
    } catch (err: any) {
      console.error("[Review] Error submitting review:", err);
      alert(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Load teacher and related data from backend
  useEffect(() => {
    fetchTeacher();
    checkConversation();
    checkBooking();
    loadReviews();
    loadMyReview();
  }, [teacherId, fetchTeacher, checkConversation, checkBooking, loadReviews, loadMyReview]);

  // Convert 24-hour format to 12-hour format with AM/PM
  const formatTime24To12 = (time24: string): string => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Function to fetch availability
  const fetchAvailability = useCallback(async () => {
    if (!teacherId) return;
    try {
      setLoadingAvailability(true);
      const data = await api(`/api/availability/teacher/${teacherId}`);
        
        // Transform backend availability data to display format
        // Backend returns: [{ day: "2025-12-10" or "Monday", date: Date, timeSlots: [{ start: "14:00", end: "16:00" }] }]
        if (Array.isArray(data) && data.length > 0) {
          const slots: AvailabilitySlot[] = [];
          
          data.forEach((item: any) => {
            let displayDay = item.day || "";
            let isoDate: string | undefined = undefined;
            
            // If it's a specific date (has date field), format it nicely
            if (item.date) {
              const date = new Date(item.date);
              displayDay = date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              // Store ISO date string for backend
              isoDate = date.toISOString().split('T')[0];
            } else if (item.day && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
              // If day is already in YYYY-MM-DD format, use it
              isoDate = item.day;
              const date = new Date(item.day);
              displayDay = date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            }
            
            const timeSlots = item.timeSlots || [];
            
            timeSlots.forEach((slot: any) => {
              if (slot.start && slot.end) {
                const startTime = formatTime24To12(slot.start);
                const endTime = formatTime24To12(slot.end);
                slots.push({
                  day: displayDay,
                  timeRange: `${startTime} - ${endTime}`,
                  isoDate: isoDate,
                });
              }
            });
          });
          
          setAvailability(slots);
        } else {
          // No availability set yet
          setAvailability([]);
        }
      } catch (err: any) {
        console.log("Availability fetch error:", err.message);
        setAvailability([]);
      } finally {
        setLoadingAvailability(false);
      }
  }, [teacherId]);

  // Load teacher availability on mount
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Initialize Socket.io for real-time availability updates
  useEffect(() => {
    let mounted = true;
    let socketInstance: Socket | null = null;

    async function setupSocket() {
      try {
        socketInstance = await initSocket();
        if (socketInstance && mounted && teacherId) {

          // Join this teacher's availability room so we get real-time updates
          socketInstance.emit("join-teacher-availability", teacherId);

          // Listen for availability updates
          socketInstance.on("availability-updated", () => {
            if (mounted) {
              fetchAvailability();
            }
          });
        }
      } catch (error) {
        // Silent fail – availability will still refresh on focus
      }
    }

    if (teacherId) {
      setupSocket();
    }

    return () => {
      mounted = false;
      if (socketInstance && teacherId) {
        // Leave this teacher's availability room when unmounting
        socketInstance.emit("leave-teacher-availability", teacherId);
        socketInstance.off("availability-updated");
      }
    };
  }, [teacherId, fetchAvailability]);

  // Refresh availability and conversation status when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchAvailability();
      checkConversation();
    }, [fetchAvailability, checkConversation])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A5C" />
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#666" }}>Teacher not found.</Text>
      </View>
    );
  }

  const handleBookLesson = (slot?: AvailabilitySlot) => {
    const params: any = { teacherId: teacher?._id };
    
    // If a specific slot was clicked, pass the day and time information
    if (slot) {
      // Parse the timeRange (e.g., "2:00 PM - 4:00 PM") to get start and end times
      const timeParts = slot.timeRange.split(" - ");
      const startTime = timeParts[0]; // Get "2:00 PM"
      const endTime = timeParts[1] || ""; // Get "4:00 PM" if available
      
      params.selectedDay = slot.day; // Display format
      params.selectedTime = startTime;
      params.selectedTimeRange = slot.timeRange; // Pass full range for display
      if (slot.isoDate) {
        params.selectedDateISO = slot.isoDate; // ISO format for backend
      }
      if (endTime) {
        params.selectedEndTime = endTime;
      }
    }
    
    router.push({
      pathname: "/booking/booking-confirmation",
      params,
    });
  };

  const handleContact = () => {
    // Navigate to chat if conversation exists, otherwise to contact form
    if (hasConversation) {
      router.push({
        pathname: "/chat/[id]",
        params: { 
          id: teacher?._id,
          contactName: teacher?.name || "Teacher",
          contactRole: "teacher"
        },
      });
    } else {
      router.push({
        pathname: "/booking/contact-detail",
        params: { teacherId: teacher?._id },
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header with Back Button */}
        <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Profile Card (overlapping header) */}
        <View style={styles.content}>
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Avatar
                src={teacher?.profileImage}
                fallback={teacher?.name?.charAt(0) || "T"}
                size={80}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.teacherName}>{teacher?.name}</Text>
                <Text style={styles.instrumentsText}>
                  {teacher?.instruments?.join(", ") || "Instruments"}
                </Text>
                {teacher?.averageRating !== null && teacher?.averageRating !== undefined && (
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={16} color="#FFB800" />
                    <Text style={styles.ratingText}>{teacher.averageRating.toFixed(1)}</Text>
                    {teacher.reviewCount !== undefined && teacher.reviewCount > 0 && (
                      <Text style={styles.reviewsText}>
                        ({teacher.reviewCount} {teacher.reviewCount === 1 ? "review" : "reviews"})
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.detailsDivider}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={20} color="#FF6A5C" />
                <Text style={styles.detailText}>{teacher?.location || "Not specified"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="trophy-outline" size={20} color="#FF6A5C" />
                <Text style={styles.detailText}>
                  {teacher?.experience || "Experience not listed"}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="musical-notes-outline" size={20} color="#FF6A5C" />
                <Text style={styles.detailText}>
                  Teaches {teacher?.instruments?.join(" & ") || "Instruments"}
                </Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>${teacher?.rate || 0}</Text>
              <Text style={styles.priceLabel}>per hour</Text>
            </View>
          </Card>

          {/* About Section */}
          <Card style={styles.aboutCard}>
            <Text style={styles.cardTitle}>About</Text>
            {teacher?.about ? (
              <Text style={styles.aboutText}>
                {teacher.about}
              </Text>
            ) : (
              <Text style={styles.noAboutText}>
                This teacher hasn't added a bio yet.
              </Text>
            )}
          </Card>

          {/* Specialties */}
          {teacher?.specialties && teacher.specialties.length > 0 && (
            <Card style={styles.specialtiesCard}>
              <Text style={styles.cardTitle}>Specialties</Text>
              <View style={styles.badgesRow}>
                {teacher.specialties.map((specialty, index) => (
                  <Badge
                    key={index}
                    variant={index % 2 === 0 ? "default" : "warning"}
                  >
                    {specialty}
                  </Badge>
                ))}
              </View>
            </Card>
          )}

          {/* Available Times */}
          <Card style={styles.availabilityCard}>
            <View style={styles.availabilityHeader}>
              <Ionicons name="calendar-outline" size={20} color="#FF6A5C" />
              <Text style={styles.cardTitle}>Available Times</Text>
            </View>
            {loadingAvailability ? (
              <ActivityIndicator color="#FF6A5C" style={{ marginTop: 16 }} />
            ) : availability.length === 0 ? (
              <Text style={styles.noAvailabilityText}>
                No availability set yet. Contact the teacher to schedule a lesson.
              </Text>
            ) : !hasConversation ? (
              <View style={styles.contactFirstContainer}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={48}
                  color="#FF6A5C"
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.contactFirstTitle}>Contact Teacher First</Text>
                <Text style={styles.contactFirstText}>
                  Please contact the teacher before booking a lesson. This helps ensure you're a good
                  fit and allows you to discuss your learning goals.
                </Text>
              </View>
            ) : (
              <View style={styles.slotsGrid}>
                {availability.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.slotButton}
                    onPress={() => handleBookLesson(slot)}
                  >
                    <Text style={styles.slotDay}>{slot.day}</Text>
                    <Text style={styles.slotTime}>{slot.timeRange}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>

          {/* Reviews Section */}
          <Card style={styles.reviewsCard}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.cardTitle}>Reviews</Text>
              {hasBooking && (
                <Button
                  size="sm"
                  onPress={() => setShowReviewDialog(true)}
                  style={styles.writeReviewButton}
                >
                  {myReview ? "Edit Review" : "Write Review"}
                </Button>
              )}
            </View>

            {loadingReviews ? (
              <ActivityIndicator color="#FF6A5C" style={{ marginTop: 16 }} />
            ) : reviews.length === 0 ? (
              <Text style={styles.noReviewsText}>
                No reviews yet. Be the first to review this teacher!
              </Text>
            ) : (
              <View style={styles.reviewsList}>
                {reviews.map((review) => (
                  <View key={review._id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Avatar
                        src={review.student?.profileImage}
                        fallback={review.student?.name?.charAt(0) || "S"}
                        size={40}
                      />
                      <View style={styles.reviewInfo}>
                        <Text style={styles.reviewStudentName}>
                          {review.student?.name || "Student"}
                        </Text>
                        <View style={styles.reviewRatingRow}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= review.rating ? "star" : "star-outline"}
                              size={14}
                              color="#FFB800"
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    {review.comment && (
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Button
              variant={hasConversation ? "outline" : "primary"}
              onPress={handleContact}
              style={styles.contactButton}
            >
              <Ionicons 
                name={hasConversation ? "chatbubble-outline" : "chatbubble-ellipses-outline"} 
                size={20} 
                color={hasConversation ? "#FF6A5C" : "white"} 
                style={{ marginRight: 8 }} 
              />
              <Text style={[
                styles.contactButtonText, 
                hasConversation && styles.contactButtonTextOutline,
                { fontSize: 18, fontWeight: "700" }
              ]}>
                {hasConversation ? "Message Teacher" : "Contact Teacher"}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <Text style={styles.dialogTitleText}>
            {myReview ? "Edit Your Review" : "Write a Review"}
          </Text>
          
          <Text style={styles.dialogLabel}>Rating</Text>
          <View style={styles.starRatingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setReviewRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= reviewRating ? "star" : "star-outline"}
                  size={32}
                  color="#FFB800"
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.dialogLabel}>Comment (optional)</Text>
          <Textarea
            value={reviewComment}
            onChangeText={setReviewComment}
            placeholder="Share your experience with this teacher..."
            style={styles.reviewTextarea}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />

          <View style={styles.dialogActions}>
            <Button
              variant="outline"
              onPress={() => setShowReviewDialog(false)}
              style={styles.dialogButton}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmitReview}
              disabled={submittingReview || reviewRating < 1}
              style={styles.dialogButton}
            >
              {submittingReview ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
            </Button>
          </View>
        </DialogContent>
      </Dialog>
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
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -48,
    gap: 16,
  },
  profileCard: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    borderWidth: 0,
  },
  profileInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  instrumentsText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  detailsDivider: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF6A5C",
  },
  priceLabel: {
    fontSize: 14,
    color: "#999",
  },
  aboutCard: {
    padding: 24,
  },
  specialtiesCard: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  noAboutText: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  availabilityCard: {
    padding: 24,
  },
  availabilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  slotButton: {
    flex: 1,
    minWidth: "45%",
    padding: 12,
    borderWidth: 2,
    borderColor: "#FFE0D6",
    borderRadius: 12,
    backgroundColor: "white",
  },
  slotDay: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 14,
    color: "#666",
  },
  noAvailabilityText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
  actionsRow: {
    gap: 12,
    marginTop: 8,
  },
  contactButton: {
    width: "100%",
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  contactButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  contactButtonTextOutline: {
    color: "#FF6A5C",
  },
  contactFirstContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  contactFirstTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  contactFirstText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  contactFirstButton: {
    width: "100%",
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  contactFirstButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFB800",
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  reviewsCard: {
    padding: 24,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  writeReviewButton: {
    minWidth: 120,
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  reviewHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewStudentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  reviewRatingRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  reviewComment: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 8,
  },
  noReviewsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 16,
    fontStyle: "italic",
  },
  dialogTitleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  dialogLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  starRatingContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginVertical: 16,
  },
  starButton: {
    padding: 4,
  },
  reviewTextarea: {
    minHeight: 100,
    marginTop: 8,
  },
  dialogActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    justifyContent: "flex-end",
  },
  dialogButton: {
    minWidth: 100,
  },
});
