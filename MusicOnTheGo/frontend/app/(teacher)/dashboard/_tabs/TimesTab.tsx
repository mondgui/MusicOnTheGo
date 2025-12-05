import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { api } from "../../../../lib/api";

type Availability = { day: string; slots: string[] };
type Props = { availability: Availability[] };

export default function TimesTab({ availability: initialAvailability }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [availability, setAvailability] = useState<Availability[]>(initialAvailability);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
    if (!selectedDay || !selectedTimeSlot) {
      alert("Please fill in both day and time slot");
      return;
    }

    // Parse time slot like "2:00 PM - 3:00 PM" to { start: "14:00", end: "15:00" }
    const parseTimeSlot = (timeSlot: string) => {
      const parts = timeSlot.split(" - ");
      if (parts.length !== 2) {
        throw new Error("Invalid time slot format. Use: '2:00 PM - 3:00 PM'");
      }
      
      const convertTo24Hour = (time12: string) => {
        const [time, ampm] = time12.trim().split(" ");
        const [hours, minutes] = time.split(":");
        let hour = parseInt(hours);
        if (ampm === "PM" && hour !== 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        return `${hour.toString().padStart(2, "0")}:${minutes}`;
      };

      return {
        start: convertTo24Hour(parts[0]),
        end: convertTo24Hour(parts[1]),
      };
    };

    try {
      setSaving(true);
      const timeSlotObj = parseTimeSlot(selectedTimeSlot);
      
      // Check if day already exists
      const existingDay = availability.find((a) => a.day === selectedDay);
      
      if (existingDay) {
        // For now, create a new availability entry
        // TODO: Update existing entry when backend supports it better
        await api("/api/availability", {
          method: "POST",
          auth: true,
          body: {
            day: selectedDay,
            timeSlots: [timeSlotObj],
          },
        });
      } else {
        // Create new day
        await api("/api/availability", {
          method: "POST",
          auth: true,
          body: {
            day: selectedDay,
            timeSlots: [timeSlotObj],
          },
        });
      }

      setDialogOpen(false);
      setSelectedDay("");
      setSelectedTimeSlot("");
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
              <Label>Day</Label>
              <Input
                value={selectedDay}
                onChangeText={setSelectedDay}
                placeholder="Monday, Tuesday, etc."
                style={styles.input}
              />
            </View>
            <View style={styles.formField}>
              <Label>Time Slot</Label>
              <Input
                value={selectedTimeSlot}
                onChangeText={setSelectedTimeSlot}
                placeholder="2:00 PM - 3:00 PM"
                style={styles.input}
              />
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
  input: {
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
