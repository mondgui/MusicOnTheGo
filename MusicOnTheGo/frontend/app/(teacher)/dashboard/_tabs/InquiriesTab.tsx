import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "../../../../lib/api";

type Inquiry = {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  instrument: string;
  level: string;
  ageGroup?: string;
  lessonType: string;
  availability: string;
  message?: string;
  goals?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  status: "sent" | "read" | "responded";
  createdAt: string;
};

type Props = {
  onMarkResponded?: (id: string) => void;
};

export default function InquiriesTab({ onMarkResponded }: Props) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInquiries = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api("/api/inquiries/teacher/me", { auth: true });
      setInquiries(data);
    } catch (err: any) {
      setError(err.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleMarkResponded = async (id: string) => {
    try {
      await api(`/api/inquiries/${id}/responded`, {
        method: "PUT",
        auth: true,
      });
      await loadInquiries();
      onMarkResponded?.(id);
    } catch (err: any) {
      alert(err.message || "Failed to mark as responded");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6A5C" />
        <Text style={styles.loadingText}>Loading inquiries...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={loadInquiries} style={{ marginTop: 12 }}>
          Retry
        </Button>
      </View>
    );
  }

  if (inquiries.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="mail-outline" size={64} color="#CCC" />
        <Text style={styles.emptyText}>No inquiries yet</Text>
        <Text style={styles.emptySubtext}>
          When students contact you, their inquiries will appear here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Inquiries</Text>
        <Badge>{inquiries.length} total</Badge>
      </View>

      {inquiries.map((inquiry) => (
        <Card key={inquiry._id} style={styles.inquiryCard}>
          <View style={styles.inquiryHeader}>
            <View style={styles.inquiryInfo}>
              <Text style={styles.studentName}>
                {inquiry.student?.name || "Student"}
              </Text>
              <Text style={styles.studentEmail}>
                {inquiry.student?.email || ""}
              </Text>
            </View>
            <Badge
              variant={
                inquiry.status === "responded"
                  ? "success"
                  : inquiry.status === "read"
                  ? "secondary"
                  : "warning"
              }
            >
              {inquiry.status}
            </Badge>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Ionicons name="musical-notes-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {inquiry.instrument} - {inquiry.level}
              </Text>
            </View>
            {inquiry.ageGroup && (
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{inquiry.ageGroup}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{inquiry.lessonType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{inquiry.availability}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>
                Received: {formatDate(inquiry.createdAt)}
              </Text>
            </View>
          </View>

          {inquiry.message && (
            <View style={styles.messageSection}>
              <Text style={styles.messageLabel}>Message:</Text>
              <Text style={styles.messageText}>{inquiry.message}</Text>
            </View>
          )}

          {inquiry.goals && (
            <View style={styles.messageSection}>
              <Text style={styles.messageLabel}>Goals/Interests:</Text>
              <Text style={styles.messageText}>{inquiry.goals}</Text>
            </View>
          )}

          {(inquiry.guardianName || inquiry.guardianEmail || inquiry.guardianPhone) && (
            <View style={styles.guardianSection}>
              <Text style={styles.guardianLabel}>Parent/Guardian Contact:</Text>
              {inquiry.guardianName && (
                <Text style={styles.guardianText}>
                  Name: {inquiry.guardianName}
                </Text>
              )}
              {inquiry.guardianEmail && (
                <Text style={styles.guardianText}>
                  Email: {inquiry.guardianEmail}
                </Text>
              )}
              {inquiry.guardianPhone && (
                <Text style={styles.guardianText}>
                  Phone: {inquiry.guardianPhone}
                </Text>
              )}
            </View>
          )}

          {inquiry.status !== "responded" && (
            <View style={styles.actionsRow}>
              <Button
                size="sm"
                onPress={() => handleMarkResponded(inquiry._id)}
                style={styles.respondButton}
              >
                Mark as Responded
              </Button>
            </View>
          )}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  errorText: {
    color: "#FF6A5C",
    textAlign: "center",
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
    textAlign: "center",
    marginTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  inquiryCard: {
    padding: 16,
    marginBottom: 12,
  },
  inquiryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  inquiryInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: "#666",
  },
  detailsSection: {
    marginTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  messageSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  guardianSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  guardianLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  guardianText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  respondButton: {
    minWidth: 150,
  },
});

