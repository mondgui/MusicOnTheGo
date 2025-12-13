import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type Booking = {
  _id: string;
  studentName: string;
  instrument: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending" | "Rejected";
};

type Props = {
  bookings: Booking[];
  user?: any;
};

export default function AnalyticsTab({ bookings, user }: Props) {
  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Parse dates and categorize bookings
    const allBookings = bookings.map(booking => {
      let bookingDate: Date;
      try {
        // Try to parse the date string
        bookingDate = new Date(booking.date);
        if (isNaN(bookingDate.getTime())) {
          // If parsing fails, assume it's a future date
          bookingDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }
      } catch {
        bookingDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
      return { ...booking, parsedDate: bookingDate };
    });

    const confirmedBookings = allBookings.filter(b => b.status === "Confirmed");
    const pendingBookings = allBookings.filter(b => b.status === "Pending");
    const rejectedBookings = allBookings.filter(b => b.status === "Rejected");
    
    // Upcoming lessons (confirmed and in the future)
    const upcomingLessons = confirmedBookings.filter(
      b => b.parsedDate >= now
    );
    
    // This month's lessons
    const thisMonthLessons = confirmedBookings.filter(
      b => b.parsedDate >= startOfMonth && b.parsedDate <= now
    );
    
    // Unique students
    const uniqueStudents = new Set(
      allBookings.map(b => b.studentName).filter(Boolean)
    );
    
    // Booking acceptance rate
    const totalDecided = confirmedBookings.length + rejectedBookings.length;
    const acceptanceRate = totalDecided > 0
      ? Math.round((confirmedBookings.length / totalDecided) * 100)
      : 0;
    
    // Most popular time slots (extract hour from time string)
    const timeSlotCounts: { [key: string]: number } = {};
    confirmedBookings.forEach(booking => {
      // Extract hour from time string like "2:00 PM - 3:00 PM"
      const match = booking.time.match(/(\d+):\d+\s*(AM|PM)/);
      if (match) {
        const hour = match[1] + " " + match[2];
        timeSlotCounts[hour] = (timeSlotCounts[hour] || 0) + 1;
      }
    });
    
    const mostPopularTime = Object.entries(timeSlotCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

    return {
      totalLessons: confirmedBookings.length,
      thisMonthLessons: thisMonthLessons.length,
      activeStudents: uniqueStudents.size,
      upcomingLessons: upcomingLessons.length,
      pendingBookings: pendingBookings.length,
      acceptanceRate,
      mostPopularTime,
    };
  }, [bookings]);

  const StatCard = ({ 
    icon, 
    label, 
    value, 
    subtitle, 
    color = "#FF6A5C" 
  }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    label: string; 
    value: string | number; 
    subtitle?: string;
    color?: string;
  }) => (
    <Card style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{String(value ?? 0)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtitle ? <Text style={styles.statSubtitle}>{subtitle}</Text> : null}
    </Card>
  );

  return (
    <View style={styles.section}>
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Ionicons name="analytics-outline" size={24} color="#FF6A5C" />
          <Text style={styles.sectionTitle}>Teaching Insights</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Track your teaching performance and student engagement
        </Text>
      </Card>

      {/* Key Metrics */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="calendar-outline"
          label="Total Lessons"
          value={stats.totalLessons}
          subtitle={`${stats.thisMonthLessons} this month`}
          color="#FF6A5C"
        />
        <StatCard
          icon="people-outline"
          label="Active Students"
          value={stats.activeStudents}
          color="#FF9076"
        />
        <StatCard
          icon="time-outline"
          label="Upcoming"
          value={stats.upcomingLessons}
          subtitle="Confirmed lessons"
          color="#4A90E2"
        />
        <StatCard
          icon="checkmark-circle-outline"
          label="Acceptance Rate"
          value={`${stats.acceptanceRate}%`}
          subtitle="Bookings approved"
          color="#059669"
        />
      </View>

      {/* Pending Bookings Alert */}
      {stats.pendingBookings > 0 && (
        <Card style={styles.alertCard}>
          <View style={styles.alertRow}>
            <Ionicons name="notifications-outline" size={20} color="#D97706" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {stats.pendingBookings} Pending {stats.pendingBookings === 1 ? "Booking" : "Bookings"}
              </Text>
              <Text style={styles.alertText}>
                Review and respond to student booking requests
              </Text>
            </View>
            <Badge variant="warning">{stats.pendingBookings}</Badge>
          </View>
        </Card>
      )}

      {/* Additional Insights */}
      <Card style={styles.insightsCard}>
        <Text style={styles.insightsTitle}>Quick Insights</Text>
        <View style={styles.insightRow}>
          <Ionicons name="time-outline" size={18} color="#666" />
          <Text style={styles.insightText}>
            Most popular time: <Text style={styles.insightValue}>{stats.mostPopularTime}</Text>
          </Text>
        </View>
        {user?.rate && (
          <View style={styles.insightRow}>
            <Ionicons name="cash-outline" size={18} color="#666" />
            <Text style={styles.insightText}>
              Hourly rate: <Text style={styles.insightValue}>${user.rate}/hour</Text>
            </Text>
          </View>
        )}
        {stats.totalLessons > 0 && user?.rate && (
          <View style={styles.insightRow}>
            <Ionicons name="trending-up-outline" size={18} color="#666" />
            <Text style={styles.insightText}>
              Estimated earnings: <Text style={styles.insightValue}>
                ${((stats.totalLessons * (user.rate || 0)) || 0).toLocaleString()}
              </Text>
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    gap: 16,
  },
  headerCard: {
    padding: 16,
    backgroundColor: "#FFF5F3",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 16,
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  statSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  alertCard: {
    padding: 16,
    backgroundColor: "#FFF3C4",
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: "#666",
  },
  insightsCard: {
    padding: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  insightValue: {
    fontWeight: "600",
    color: "#333",
  },
});

