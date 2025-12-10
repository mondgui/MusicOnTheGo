import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type DatePickerProps = {
  value?: Date | null;
  onValueChange: (date: Date | null) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function DatePicker({
  value,
  onValueChange,
  placeholder = "Select a date",
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewingYear, setViewingYear] = useState(value?.getFullYear() || new Date().getFullYear());
  const [viewingMonth, setViewingMonth] = useState(value?.getMonth() || new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(value?.getDate() || null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayAbbreviations = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewingYear, viewingMonth);
    const firstDay = getFirstDayOfMonth(viewingYear, viewingMonth);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    // Fill remaining cells to make a complete grid (6 rows x 7 columns = 42 cells)
    const totalCells = 42;
    while (days.length < totalCells) {
      days.push(null);
    }

    return days;
  };

  const handlePreviousMonth = () => {
    if (viewingMonth === 0) {
      setViewingMonth(11);
      setViewingYear(viewingYear - 1);
    } else {
      setViewingMonth(viewingMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewingMonth === 11) {
      setViewingMonth(0);
      setViewingYear(viewingYear + 1);
    } else {
      setViewingMonth(viewingMonth + 1);
    }
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
  };

  const handleConfirm = () => {
    if (selectedDay === null) return;
    
    const date = new Date(viewingYear, viewingMonth, selectedDay);
    
    // Validate date
    if (minimumDate && date < minimumDate) {
      return;
    }
    if (maximumDate && date > maximumDate) {
      return;
    }
    
    onValueChange(date);
    setModalVisible(false);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return placeholder;
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isDateDisabled = (day: number): boolean => {
    if (minimumDate) {
      const date = new Date(viewingYear, viewingMonth, day);
      const minDateStart = new Date(minimumDate.getFullYear(), minimumDate.getMonth(), minimumDate.getDate());
      minDateStart.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      if (date < minDateStart) return true;
    }
    if (maximumDate) {
      const date = new Date(viewingYear, viewingMonth, day);
      const maxDateStart = new Date(maximumDate.getFullYear(), maximumDate.getMonth(), maximumDate.getDate());
      maxDateStart.setHours(23, 59, 59, 999);
      date.setHours(0, 0, 0, 0);
      if (date > maxDateStart) return true;
    }
    return false;
  };

  const calendarDays = generateCalendarDays();

  return (
    <View>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => {
          const dateToUse = value || new Date();
          setViewingYear(dateToUse.getFullYear());
          setViewingMonth(dateToUse.getMonth());
          setSelectedDay(dateToUse.getDate());
          setModalVisible(true);
        }}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {formatDate(value ?? null)}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Date Picker</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Month/Year Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity
                onPress={handlePreviousMonth}
                style={styles.navButton}
              >
                <Ionicons name="chevron-back" size={20} color="#333" />
              </TouchableOpacity>
              <Text style={styles.monthYearText}>
                {months[viewingMonth]} {viewingYear}
              </Text>
              <TouchableOpacity
                onPress={handleNextMonth}
                style={styles.navButton}
              >
                <Ionicons name="chevron-forward" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Day Abbreviations */}
            <View style={styles.dayHeaders}>
              {dayAbbreviations.map((day, index) => (
                <View key={index} style={styles.dayHeader}>
                  <Text style={styles.dayHeaderText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <View key={index} style={styles.calendarDay} />;
                }

                const isSelected = selectedDay === day;
                const isDisabled = isDateDisabled(day);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      isSelected && styles.calendarDaySelected,
                      isDisabled && styles.calendarDayDisabled,
                    ]}
                    onPress={() => !isDisabled && handleDaySelect(day)}
                    disabled={isDisabled}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSelected && styles.calendarDayTextSelected,
                        isDisabled && styles.calendarDayTextDisabled,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                disabled={selectedDay === null}
              >
                <Text style={styles.confirmButtonText}>Confirm date</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF5F3",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#FFE0D6",
    minHeight: 48,
  },
  triggerText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholder: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  dayHeaders: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  calendarDay: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  calendarDaySelected: {
    backgroundColor: "#FF6A5C",
    borderRadius: 8,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 16,
    color: "#333",
  },
  calendarDayTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  calendarDayTextDisabled: {
    color: "#999",
  },
  modalFooter: {
    gap: 12,
  },
  confirmButton: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#FF6A5C",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
  },
});
