import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../../lib/api";

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    teacherId, 
    selectedDay, 
    selectedTime: preSelectedTime,
    selectedTimeRange,
    selectedEndTime,
    selectedDateISO // ISO format date string (YYYY-MM-DD)
  } = params;
  
  const [teacher, setTeacher] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(selectedDay ? String(selectedDay) : "");
  const [selectedTime, setSelectedTime] = useState(preSelectedTime ? String(preSelectedTime) : "");
  const [loading, setLoading] = useState(false);

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const data = await api(`/api/teachers/${teacherId}`, {
          method: "GET",
          auth: true,
        });
        setTeacher(data);
      } catch (err: any) {
        Alert.alert("Error", "Failed to load teacher information");
        router.back();
      }
    };

    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId]);

  const availableDates = [
    "Nov 15, 2025",
    "Nov 16, 2025",
    "Nov 18, 2025",
    "Nov 20, 2025",
    "Nov 22, 2025",
  ];

  const availableTimes = [
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ];

  // Convert 12-hour format to 24-hour format
  const formatTime12To24 = (time12: string): string => {
    const [time, ampm] = time12.trim().split(" ");
    const [hours, minutes] = time.split(":");
    let hour = parseInt(hours);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  };

  // Add hours to a time string (24-hour format)
  const addHours = (time24: string, hoursToAdd: number): string => {
    const [hours, minutes] = time24.split(":");
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + hoursToAdd * 60;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Error", "Please select both date and time");
      return;
    }

    if (!teacher) {
      Alert.alert("Error", "Teacher information not loaded");
      return;
    }

    const teacherIdValue = teacher._id || teacherId;
    if (!teacherIdValue) {
      Alert.alert("Error", "Teacher ID is missing");
      return;
    }

    try {
      setLoading(true);
      
      // Convert selected time to 24-hour format and create timeSlot object
      const startTime24 = formatTime12To24(selectedTime);
      
      // If we have an end time from the availability slot, use it; otherwise add 1 hour
      let endTime24: string;
      if (selectedEndTime) {
        endTime24 = formatTime12To24(String(selectedEndTime));
      } else {
        endTime24 = addHours(startTime24, 1); // Assume 1-hour lesson duration
      }
      
      // Convert selectedDate to an actual date string
      // Priority: Use ISO date if available, then check if it's a day name, then try parsing
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let actualDate: Date;
      let dateString: string;
      
      // If we have an ISO date string, use it directly
      if (selectedDateISO) {
        dateString = String(selectedDateISO);
        actualDate = new Date(dateString);
        if (isNaN(actualDate.getTime())) {
          Alert.alert("Error", "Invalid date format");
          setLoading(false);
          return;
        }
      } else if (dayNames.includes(selectedDate)) {
        // Convert day name to next occurrence date
        const dayIndex = dayNames.indexOf(selectedDate);
        const today = new Date();
        const currentDay = today.getDay();
        let daysUntil = dayIndex - currentDay;
        if (daysUntil <= 0) daysUntil += 7; // Next week if today or past
        
        actualDate = new Date(today);
        actualDate.setDate(today.getDate() + daysUntil);
        dateString = actualDate.toISOString().split('T')[0];
      } else {
        // Try to parse as date string (handles formatted dates like "Wednesday, December 10, 2025")
        actualDate = new Date(selectedDate);
        if (isNaN(actualDate.getTime())) {
          Alert.alert("Error", "Invalid date format");
          setLoading(false);
          return;
        }
        dateString = actualDate.toISOString().split('T')[0];
      }
      
      // Validate all required fields before sending
      if (!dateString || !startTime24 || !endTime24) {
        Alert.alert("Error", "Invalid date or time selection");
        setLoading(false);
        return;
      }
      
      // Create booking - backend expects: teacher (ID), day (date string), timeSlot {start, end}
      const response = await api("/api/bookings", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          teacher: teacherIdValue,
          day: dateString,
          timeSlot: {
            start: startTime24,
            end: endTime24,
          },
        }),
      });

      // Check if there's a conflict warning
      if (response.conflictWarning) {
        Alert.alert(
          "Booking Requested",
          response.conflictWarning + "\n\nYour booking request has been submitted. The teacher will review all requests for this time slot.",
          [{ text: "OK" }]
        );
      }

      // Format date for display
      const formattedDate = actualDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      
      // Navigate to success screen with booking details
      router.push({
        pathname: "/booking/booking-success",
        params: {
          teacherName: teacher.name,
          teacherImage: teacher.image || "",
          teacherInstruments: Array.isArray(teacher.instruments) 
            ? teacher.instruments.join(", ") 
            : teacher.instruments || "",
          teacherLocation: teacher.location || "",
          date: formattedDate,
          time: selectedTime,
          price: teacher.price || "0",
        },
      });
    } catch (err: any) {
      // Handle conflict errors (409) with a more user-friendly message
      if (err.message && err.message.includes("already booked") || err.message.includes("already have a booking")) {
        Alert.alert(
          "Time Slot Unavailable",
          err.message || "This time slot is no longer available. Please select another time.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", err.message || "Failed to confirm booking");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
          <Text style={styles.loadingText}>Loading...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Confirm Your Booking</Text>
          <Text style={styles.headerSubtitle}>
            Select your preferred date and time
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Teacher Info */}
        <Card style={styles.teacherCard}>
          <View style={styles.teacherInfo}>
            <Avatar
              src={teacher.image}
              fallback={teacher.name?.charAt(0) || "T"}
              size={56}
            />
            <View style={styles.teacherDetails}>
              <Text style={styles.teacherName}>{teacher.name}</Text>
              <Text style={styles.teacherInstruments}>
                {Array.isArray(teacher.instruments)
                  ? teacher.instruments.join(", ")
                  : teacher.instruments || "Music Teacher"}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${teacher.price || "0"}</Text>
              <Text style={styles.priceLabel}>per hour</Text>
            </View>
          </View>
        </Card>

        {/* Date & Time Selection - Only show if not pre-selected */}
        {(!selectedDate || !selectedTime) && (
          <Card style={styles.selectionCard}>
            <View style={styles.selectionGroup}>
              <Label style={styles.label}>
                <Ionicons name="calendar-outline" size={16} color="#FF6A5C" />
                <Text style={styles.labelText}> Select Date</Text>
              </Label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a date" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>

            <View style={styles.selectionGroup}>
              <Label style={styles.label}>
                <Ionicons name="time-outline" size={16} color="#FF6A5C" />
                <Text style={styles.labelText}> Select Time</Text>
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>
          </Card>
        )}

        {/* Show selected day and time if pre-selected */}
        {selectedDate && selectedTime && (
          <Card style={styles.selectionCard}>
            <View style={styles.selectionGroup}>
              <Label style={styles.label}>
                <Ionicons name="calendar-outline" size={16} color="#FF6A5C" />
                <Text style={styles.labelText}> Selected Day</Text>
              </Label>
              <Text style={styles.selectedValue}>{selectedDate}</Text>
            </View>

            <View style={styles.selectionGroup}>
              <Label style={styles.label}>
                <Ionicons name="time-outline" size={16} color="#FF6A5C" />
                <Text style={styles.labelText}> Selected Time</Text>
              </Label>
              <Text style={styles.selectedValue}>
                {selectedTimeRange || selectedTime}
              </Text>
            </View>
          </Card>
        )}

        {/* Booking Summary */}
        {selectedDate && selectedTime && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLabel}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.summaryLabelText}>Teacher</Text>
                </View>
                <Text style={styles.summaryValue}>{teacher.name}</Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabel}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.summaryLabelText}>Date</Text>
                </View>
                <Text style={styles.summaryValue}>{selectedDate}</Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabel}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.summaryLabelText}>Time</Text>
                </View>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <View style={styles.summaryLabel}>
                  <Ionicons name="cash-outline" size={16} color="#FF6A5C" />
                  <Text style={styles.totalLabel}>Total</Text>
                </View>
                <Text style={styles.totalValue}>${teacher.price || "0"}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Confirm Button */}
        <Button
          onPress={handleConfirm}
          disabled={!selectedDate || !selectedTime || loading}
          style={styles.confirmButton}
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </Button>

        <Text style={styles.disclaimer}>
          You can cancel or reschedule up to 24 hours before your lesson
        </Text>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
  headerContent: {
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
  },
  loadingText: {
    color: "white",
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
  teacherCard: {
    marginBottom: 20,
    padding: 16,
  },
  teacherInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  teacherDetails: {
    flex: 1,
    marginLeft: 12,
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
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF6A5C",
  },
  priceLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  selectionCard: {
    marginBottom: 20,
    padding: 20,
  },
  selectionGroup: {
    marginBottom: 20,
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFF5F3",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFE0D6",
  },
  summaryCard: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#FFE0D6",
    borderColor: "#FFD4C4",
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  summaryContent: {
    gap: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryLabelText: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  totalRow: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#FFD4C4",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF6A5C",
  },
  confirmButton: {
    marginBottom: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
});

