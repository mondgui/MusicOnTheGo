import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

export default function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Check if this is from booking confirmation or inquiry
  const isBooking = params.date && params.time;
  const isInquiry = !isBooking;

  if (isInquiry) {
    // Original inquiry success flow
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
          <Ionicons name="checkmark-circle-outline" size={80} color="white" />
          <Text style={styles.title}>Message Sent!</Text>
          <Text style={styles.subtitle}>
            Your inquiry has been delivered to the teacher.
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.description}>
            You will receive a response when the teacher reviews your request.
          </Text>

          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => router.push("/(student)/dashboard")}
          >
            <LinearGradient
              colors={["#FF9076", "#FF6A5C"]}
              style={styles.button}
            >
              <Ionicons name="home-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Back to Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Booking confirmation success flow
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
        <View style={styles.successIconContainer}>
          <View style={styles.successIconBackground}>
            <Ionicons name="checkmark-circle" size={64} color="#059669" />
          </View>
        </View>
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your lesson has been successfully booked
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Booking Details Card */}
        <Card style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Lesson Details</Text>
          </View>

          {/* Teacher Info */}
          <View style={styles.teacherInfo}>
            <Avatar
              src={params.teacherImage as string}
              fallback={(params.teacherName as string)?.charAt(0) || "T"}
              size={64}
            />
            <View style={styles.teacherDetails}>
              <Text style={styles.teacherName}>
                {params.teacherName || "Teacher"}
              </Text>
              <Text style={styles.teacherInstruments}>
                {params.teacherInstruments || "Music Teacher"}
              </Text>
            </View>
          </View>

          {/* Date, Time, Location */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#FF6A5C" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{params.date}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time-outline" size={20} color="#FF6A5C" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{params.time}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="location-outline" size={20} color="#FF6A5C" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {params.teacherLocation || "TBD"}
                </Text>
              </View>
            </View>
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>${params.price || "0"}</Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            onPress={() => router.push("/(student)/dashboard")}
            style={styles.homeButton}
          >
            Back to Home
          </Button>
        </View>

        {/* Confirmation Message */}
        <Card style={styles.confirmationCard}>
          <Text style={styles.confirmationText}>
            Your booking request has been sent to the teacher. You'll receive a confirmation once the teacher approves your request.
          </Text>
        </Card>
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
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIconBackground: {
    backgroundColor: "#D6FFE1",
    borderRadius: 50,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    color: "white",
    opacity: 0.9,
    fontSize: 16,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  detailsCard: {
    marginBottom: 20,
    padding: 20,
  },
  detailsHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  teacherInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  teacherDetails: {
    flex: 1,
    marginLeft: 16,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  teacherInstruments: {
    fontSize: 14,
    color: "#666",
  },
  detailsSection: {
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIconContainer: {
    backgroundColor: "#FFE0D6",
    padding: 8,
    borderRadius: 8,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF6A5C",
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  homeButton: {
    marginTop: 0,
  },
  confirmationCard: {
    padding: 16,
    backgroundColor: "#E3F2FD",
    borderColor: "#BBDEFB",
    borderWidth: 1,
  },
  confirmationText: {
    fontSize: 14,
    color: "#1565C0",
    textAlign: "center",
    lineHeight: 20,
  },
  // Inquiry success styles
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonWrapper: {
    width: "100%",
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
});
