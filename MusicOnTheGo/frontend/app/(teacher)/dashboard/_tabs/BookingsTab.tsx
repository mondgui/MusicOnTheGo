import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type Booking = {
  _id: string;
  studentName: string;
  instrument: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending";
};

type Props = {
  bookings: Booking[];
  loading?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
};

export default function BookingsTab({ bookings, loading, onAccept, onReject }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>All Bookings</Text>
        <Badge>{bookings.length} total</Badge>
      </View>

      {loading && <ActivityIndicator color="#FF6A5C" style={{ marginBottom: 12 }} />}

      {!loading && bookings.length === 0 && (
        <Text style={{ color: "#777" }}>No bookings yet.</Text>
      )}

      {bookings.map((item) => (
        <Card key={item._id} style={styles.bookingCard}>
          <View style={styles.bookingHeaderRow}>
            <View style={styles.bookingInfo}>
              <Text style={styles.studentName}>{item.studentName || "Student"}</Text>
              <Text style={styles.instrument}>{item.instrument}</Text>
            </View>
            <Badge
              variant={item.status === "Confirmed" ? "success" : "warning"}
            >
              {item.status}
            </Badge>
          </View>
          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{item.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  bookingCard: {
    padding: 16,
    marginBottom: 12,
  },
  bookingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  instrument: {
    fontSize: 14,
    color: "#666",
  },
  bookingDetails: {
    flexDirection: "row",
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
});



// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";

// type Booking = {
//   _id: string;
//   studentName: string;
//   instrument: string;
//   date: string;
//   time: string;
//   status: "Confirmed" | "Pending";
// };

// type Props = {
//   bookings: Booking[];
//   loading?: boolean;
//   onAccept?: (id: string) => void;
//   onReject?: (id: string) => void;
// };

// export default function BookingsTab({ bookings, loading, onAccept, onReject }: Props) {
//   return (
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>All Bookings</Text>

//       {loading && <ActivityIndicator color="#FF6A5C" style={{ marginBottom: 12 }} />}

//       {!loading && bookings.length === 0 && (
//         <Text style={{ color: "#777" }}>No bookings yet.</Text>
//       )}

//       {bookings.map((item) => (
//         <View key={item._id} style={styles.bookingCard}>
//           <View style={styles.bookingHeaderRow}>
//             <View>
//               <Text style={styles.cardTitle}>{item.studentName || "Student"}</Text>
//               <Text style={styles.cardSubtitle}>{item.instrument}</Text>
//             </View>

//             <View
//               style={[
//                 styles.statusBadge,
//                 item.status === "Confirmed" ? styles.confirmed : styles.pending,
//               ]}
//             >
//               <Text style={styles.statusText}>{item.status}</Text>
//             </View>
//           </View>

//           <Text style={styles.cardDetail}>📅 {item.date}</Text>
//           <Text style={styles.cardDetail}>⏰ {item.time}</Text>

//           {item.status === "Pending" && (
//             <View style={styles.actionsRow}>
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.rejectBtn]}
//                 onPress={() => onReject?.(item._id)}
//               >
//                 <Text style={styles.actionText}>Reject</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.acceptBtn]}
//                 onPress={() => onAccept?.(item._id)}
//               >
//                 <Text style={[styles.actionText, { color: "white" }]}>Accept</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       ))}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   section: { marginBottom: 30 },
//   sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
//   bookingCard: {
//     backgroundColor: "white",
//     padding: 18,
//     borderRadius: 15,
//     marginBottom: 12,
//   },
//   bookingHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   cardTitle: { fontSize: 16, fontWeight: "700" },
//   cardSubtitle: { color: "#777", marginTop: 3 },
//   cardDetail: { color: "#555", marginTop: 4 },
//   statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
//   confirmed: { backgroundColor: "#D6FFE1" },
//   pending: { backgroundColor: "#FFF3C4" },
//   statusText: { fontWeight: "600", color: "#333" },
//   actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 },
//   actionBtn: {
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#FF6A5C",
//   },
//   rejectBtn: { backgroundColor: "white" },
//   acceptBtn: { backgroundColor: "#FF6A5C", borderColor: "#FF6A5C" },
//   actionText: { fontWeight: "700", color: "#FF6A5C" },
// });
