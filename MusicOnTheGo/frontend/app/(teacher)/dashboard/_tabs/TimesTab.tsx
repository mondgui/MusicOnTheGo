import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { api } from "../../../../lib/api";

type Availability = { 
  day: string; 
  slots: string[];
  originalDay?: string; // Original day string from backend (YYYY-MM-DD or day name)
  originalDate?: Date; // Parsed date object for grouping
};
type Props = { availability: Availability[] };

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  // Refresh availability when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAvailability();
    }, [])
  );

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const data = await api("/api/availability/me", { auth: true });
      // Transform backend data to match our format
      // Backend returns: [{ day: "2025-12-10" or "Monday", date: Date, timeSlots: [{ start: "14:00", end: "16:00" }] }]
      if (Array.isArray(data)) {
        const transformed = data
          .filter((item: any) => {
            // Filter out recurring weekly availability (only day names without dates)
            // Only keep items that have a specific date (YYYY-MM-DD format or date object)
            if (item.day && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
              return true; // Has a specific date
            }
            if (item.date) {
              return true; // Has a date object
            }
            // Filter out day names like "Sunday", "Wednesday", etc.
            return false;
          })
          .map((item: any) => {
            // Format the day/date for display - always show full date format
            let displayDay = item.day;
            
            // Check if day is a date string (YYYY-MM-DD format)
            if (item.day && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
              // Parse as local date to avoid timezone issues
              const [year, month, day] = item.day.split('-').map(Number);
              const date = new Date(year, month - 1, day);
              displayDay = date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            } else if (item.date) {
              // If it's a specific date object, format it nicely
              const date = new Date(item.date);
              displayDay = date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            }
            
            // Parse the date for grouping
            let parsedDate: Date | null = null;
            if (item.day && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
              // Parse as local date to avoid timezone issues
              const [year, month, day] = item.day.split('-').map(Number);
              parsedDate = new Date(year, month - 1, day);
            } else if (item.date) {
              parsedDate = new Date(item.date);
            }

            return {
              day: displayDay,
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
              originalDay: item.day,
              originalDate: parsedDate,
            };
          });
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
    if (!selectedDate || !selectedFromTime || !selectedToTime) {
      alert("Please select date, from time, and to time");
      return;
    }

    // Validate that "To" time is after "From" time
    if (!isTimeBefore(selectedFromTime, selectedToTime)) {
      alert("The 'To' time must be after the 'From' time");
      return;
    }

    // If the selected date is today, validate that the time slots are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateNormalized = new Date(selectedDate);
    selectedDateNormalized.setHours(0, 0, 0, 0);
    
    if (selectedDateNormalized.getTime() === today.getTime()) {
      // It's today - check if the "From" time has already passed
      const now = new Date();
      const currentTime24 = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const fromTime24 = formatTime12To24(selectedFromTime);
      
      if (fromTime24 <= currentTime24) {
        alert("You cannot set availability for a time that has already passed today. Please select a future time.");
        return;
      }
    }

    try {
      setSaving(true);
      const timeSlotObj = {
        start: formatTime12To24(selectedFromTime),
        end: formatTime12To24(selectedToTime),
      };
      
      // Format date as YYYY-MM-DD
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Create new availability entry
      await api("/api/availability", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          day: dateStr, // Send date as YYYY-MM-DD string
          date: selectedDate.toISOString(), // Also send as ISO date
          timeSlots: [timeSlotObj],
        }),
      });

      setDialogOpen(false);
      setSelectedDate(null);
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
              <Label>Date</Label>
              <DatePicker
                value={selectedDate}
                onValueChange={setSelectedDate}
                placeholder="Select a date"
                minimumDate={(() => {
                  // Set minimum date to start of today (midnight) so today can be selected
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return today;
                })()}
              />
            </View>
            <View style={styles.timeRow}>
              <View style={[styles.formField, styles.timeField]}>
                <Label>From</Label>
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
              <View style={[styles.formField, styles.timeField]}>
                <Label>To</Label>
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
            (() => {
              // Helper function to categorize availability by time period
              const getTimePeriod = (item: Availability): string | null => {
                if (!item.originalDate) return null; // Return null for invalid dates

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                // End of this week (7 days from today, exclusive)
                const endOfThisWeek = new Date(today);
                endOfThisWeek.setDate(endOfThisWeek.getDate() + 7);
                
                // End of this month (first day of next month)
                const endOfThisMonth = new Date(today);
                endOfThisMonth.setMonth(endOfThisMonth.getMonth() + 1);
                endOfThisMonth.setDate(1);

                const itemDate = new Date(item.originalDate);
                itemDate.setHours(0, 0, 0, 0);

                if (itemDate.getTime() === today.getTime()) {
                  return "Today";
                } else if (itemDate.getTime() === tomorrow.getTime()) {
                  return "Tomorrow";
                } else if (itemDate < endOfThisWeek) {
                  return "This Week";
                } else if (itemDate < endOfThisMonth) {
                  return "This Month";
                } else {
                  // For dates beyond this month, return month and year (e.g., "January 2026")
                  // For dates in different years, return just the year (e.g., "2027", "2028")
                  const currentYear = today.getFullYear();
                  const itemYear = itemDate.getFullYear();
                  
                  if (itemYear > currentYear) {
                    // Different year - just show the year
                    return itemYear.toString();
                  } else {
                    // Same year, different month - show month and year
                    return itemDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                  }
                }
              };

              // Group availability by time period (filter out invalid dates)
              const grouped = availability.reduce((groups, item) => {
                const period = getTimePeriod(item);
                if (!period) return groups; // Skip items with invalid dates
                if (!groups[period]) {
                  groups[period] = [];
                }
                groups[period].push(item);
                return groups;
              }, {} as Record<string, Availability[]>);

              // Sort groups in order: Today, Tomorrow, This Week, This Month, then by date
              const groupOrder = ["Today", "Tomorrow", "This Week", "This Month"];
              const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
                const aIndex = groupOrder.indexOf(a);
                const bIndex = groupOrder.indexOf(b);
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                
                // For month/year or year-only groups, sort chronologically
                const dateA = grouped[a][0]?.originalDate;
                const dateB = grouped[b][0]?.originalDate;
                if (dateA && dateB) {
                  return dateA.getTime() - dateB.getTime();
                }
                return a.localeCompare(b); // Fallback to alphabetical
              });

              // Sort items within each group by date
              sortedGroupKeys.forEach(key => {
                grouped[key].sort((a, b) => {
                  if (!a.originalDate || !b.originalDate) return 0;
                  return a.originalDate.getTime() - b.originalDate.getTime();
                });
              });

              return sortedGroupKeys.map((groupKey) => (
                <View key={groupKey} style={styles.groupSection}>
                  <Text style={styles.groupHeader}>{groupKey}</Text>
                  {grouped[groupKey].map((item, index) => (
                    <Card key={`${groupKey}-${index}`} style={styles.availabilityCard}>
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
                  ))}
                </View>
              ));
            })()
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
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  timeField: {
    flex: 1,
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
  groupSection: {
    marginTop: 24,
    marginBottom: 8,
  },
  groupHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
});
