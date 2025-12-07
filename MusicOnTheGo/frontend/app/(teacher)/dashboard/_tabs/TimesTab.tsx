import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { api } from "../../../../lib/api";

type Availability = { day: string; slots: string[] };
type Props = { availability: Availability[] };

// Days of the week matching backend enum
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Generate individual time options with 15-minute intervals
// Format: "8:00 AM", "8:15 AM", "8:30 AM", etc.
function generateTimeOptions(): string[] {
  const times: string[] = [];
  const startHour = 8; // 8:00 AM
  const endHour = 22; // 10:00 PM (22:00)
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === endHour && minute > 0) break; // Don't go past end hour
      const time24 = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      times.push(formatTime24To12(time24));
    }
  }
  
  return times;
}

// Convert 24-hour format to 12-hour format with AM/PM
function formatTime24To12(time24: string): string {
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Convert 12-hour format to 24-hour format
function formatTime12To24(time12: string): string {
  const [time, ampm] = time12.trim().split(" ");
  const [hours, minutes] = time.split(":");
  let hour = parseInt(hours);
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${minutes}`;
}

// Compare two time strings in 12-hour format to see if time1 is before time2
function isTimeBefore(time1: string, time2: string): boolean {
  const time1_24 = formatTime12To24(time1);
  const time2_24 = formatTime12To24(time2);
  return time1_24 < time2_24;
}

const TIME_OPTIONS = generateTimeOptions();

export default function TimesTab({ availability: initialAvailability }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedFromTime, setSelectedFromTime] = useState("");
  const [selectedToTime, setSelectedToTime] = useState("");
  const [availability, setAvailability] = useState<Availability[]>(initialAvailability);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filter "To" time options to only show times after the selected "From" time
  const getAvailableToTimes = (): string[] => {
    if (!selectedFromTime) return TIME_OPTIONS;
    return TIME_OPTIONS.filter((time) => isTimeBefore(selectedFromTime, time));
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const data = await api("/api/availability/me", { auth: true });
      // Transform backend data to match our format
      // Backend returns: [{ day: "Monday", timeSlots: [{ start: "14:00", end: "16:00" }] }]
      if (Array.isArray(data)) {
        const transformed = data.map((item: any) => ({
          day: item.day,
          slots: (item.timeSlots || []).map((slot: any) => {
            // Convert "14:00" to "2:00 PM"
            const formatTime = (time24: string) => {
              const [hours, minutes] = time24.split(":");
              const hour = parseInt(hours);
              const ampm = hour >= 12 ? "PM" : "AM";
              const hour12 = hour % 12 || 12;
              return `${hour12}:${minutes} ${ampm}`;
            };
            return `${formatTime(slot.start)} - ${formatTime(slot.end)}`;
          }),
        }));
        setAvailability(transformed);
      }
    } catch (error) {
      console.error("Failed to load availability:", error);
      // Keep initial availability on error
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDay || !selectedFromTime || !selectedToTime) {
      alert("Please select day, from time, and to time");
      return;
    }

    // Validate that "To" time is after "From" time
    if (!isTimeBefore(selectedFromTime, selectedToTime)) {
      alert("The 'To' time must be after the 'From' time");
      return;
    }

    try {
      setSaving(true);
      const timeSlotObj = {
        start: formatTime12To24(selectedFromTime),
        end: formatTime12To24(selectedToTime),
      };
      
      // Create new availability entry
      await api("/api/availability", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          day: selectedDay,
          timeSlots: [timeSlotObj],
        }),
      });

      setDialogOpen(false);
      setSelectedDay("");
      setSelectedFromTime("");
      setSelectedToTime("");
      await loadAvailability(); // Reload availability
    } catch (error: any) {
      alert(error.message || "Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.section}>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button style={styles.addButton}>
            <Ionicons name="add-outline" size={18} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>Add Available Time</Text>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability</DialogTitle>
          </DialogHeader>
          <View style={styles.dialogForm}>
            <View style={styles.formField}>
              <Label>Day of Week</Label>
              <Select
                value={selectedDay}
                onValueChange={setSelectedDay}
                placeholder="Select a day"
                style={styles.select}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </Select>
            </View>
            <View style={styles.formField}>
              <Label>From (15-minute intervals)</Label>
              <Select
                value={selectedFromTime}
                onValueChange={(value) => {
                  setSelectedFromTime(value);
                  // Reset "To" time if it's now invalid
                  if (selectedToTime && !isTimeBefore(value, selectedToTime)) {
                    setSelectedToTime("");
                  }
                }}
                placeholder="Select start time"
                style={styles.select}
              >
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </Select>
            </View>
            <View style={styles.formField}>
              <Label>To (15-minute intervals)</Label>
              <Select
                value={selectedToTime}
                onValueChange={setSelectedToTime}
                placeholder={selectedFromTime ? "Select end time" : "Select 'From' time first"}
                style={styles.select}
              >
                {getAvailableToTimes().map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </Select>
            </View>
            <Button onPress={handleSave} disabled={saving} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>

      {loading ? (
        <ActivityIndicator color="#FF6A5C" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.availabilityList}>
          {availability.length === 0 ? (
            <Text style={styles.emptyText}>No availability set yet. Add your first time slot!</Text>
          ) : (
            availability.map((item, index) => (
              <Card key={index} style={styles.availabilityCard}>
                <Text style={styles.dayTitle}>{item.day}</Text>
                <View style={styles.slotsList}>
                  {item.slots.map((slot, slotIndex) => (
                    <View key={slotIndex} style={styles.slotRow}>
                      <Ionicons name="time-outline" size={16} color="#FF6A5C" />
                      <Text style={styles.slotText}>{slot}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    gap: 12,
  },
  addButton: {
    width: "100%",
    marginBottom: 16,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  dialogForm: {
    gap: 16,
  },
  formField: {
    gap: 8,
  },
  select: {
    marginTop: 0,
  },
  saveButton: {
    width: "100%",
    marginTop: 8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  availabilityList: {
    gap: 12,
  },
  availabilityCard: {
    padding: 16,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  slotsList: {
    gap: 8,
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    backgroundColor: "#FFF5F3",
    borderRadius: 8,
  },
  slotText: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
    fontSize: 14,
  },
});
