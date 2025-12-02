import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";

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
      <Text style={styles.sectionTitle}>All Bookings</Text>

      {loading && <ActivityIndicator color="#FF6A5C" style={{ marginBottom: 12 }} />}

      {!loading && bookings.length === 0 && (
        <Text style={{ color: "#777" }}>No bookings yet.</Text>
      )}

      {bookings.map((item) => (
        <View key={item._id} style={styles.bookingCard}>
          <View style={styles.bookingHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>{item.studentName || "Student"}</Text>
              <Text style={styles.cardSubtitle}>{item.instrument}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                item.status === "Confirmed" ? styles.confirmed : styles.pending,
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.cardDetail}>📅 {item.date}</Text>
          <Text style={styles.cardDetail}>⏰ {item.time}</Text>

          {item.status === "Pending" && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => onReject?.(item._id)}
              >
                <Text style={styles.actionText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => onAccept?.(item._id)}
              >
                <Text style={[styles.actionText, { color: "white" }]}>Accept</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
  bookingCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
  },
  bookingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSubtitle: { color: "#777", marginTop: 3 },
  cardDetail: { color: "#555", marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  confirmed: { backgroundColor: "#D6FFE1" },
  pending: { backgroundColor: "#FFF3C4" },
  statusText: { fontWeight: "600", color: "#333" },
  actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF6A5C",
  },
  rejectBtn: { backgroundColor: "white" },
  acceptBtn: { backgroundColor: "#FF6A5C", borderColor: "#FF6A5C" },
  actionText: { fontWeight: "700", color: "#FF6A5C" },
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
