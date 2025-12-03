import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../lib/api";

type Teacher = {
  _id: string;
  name: string;
  email: string;
  instruments: string[];
  experience: string;
  location: string;
  rate?: number;
  about?: string;
};

export default function TeacherProfileScreen() {
  const { id } = useLocalSearchParams(); // teacher ID
  const router = useRouter();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  // Load teacher from backend
  useEffect(() => {
    async function fetchTeacher() {
      try {
        const data = await api(`/api/teachers/${id}`);
//        console.log("TEACHER DATA FROM API:", data);   

        setTeacher(data);
      } catch (err: any) {
        console.log("Teacher fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTeacher();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A5C" />
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#666" }}>Teacher not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>

        <Image
          source={{ uri: "https://picsum.photos/300" }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{teacher.name}</Text>
        <Text style={styles.instrumentList}>
          {teacher.instruments.join(", ")}
        </Text>
      </LinearGradient>

      {/* DETAILS */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>About This Teacher</Text>

        <DetailRow
          icon="location-outline"
          label="Location"
          value={teacher.location || "Not specified"}
        />

        <DetailRow
          icon="book-outline"
          label="Experience"
          value={
            teacher.experience
              ? `${teacher.experience} years of experience`
              : "No experience listed"
          }
          
        />

        <DetailRow
          icon="musical-notes-outline"
          label="Instruments"
          value={teacher.instruments.join(", ")}
        />

        <DetailRow
          icon="cash-outline"
          label="Rate"
          value={teacher.rate ? `$${teacher.rate}/hour` : "Rate not specified"}
        />

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          {teacher.about || "This teacher has not added an introduction yet."}
        </Text>



        {/* Request Info Button */}
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() =>
            router.push({
              pathname: "/booking/contact-detail",
              params: { teacherId: teacher._id },
            })
          }
        >
          <LinearGradient
            colors={["#FF9076", "#FF6A5C"]}
            style={styles.requestButtonGradient}
          >
            <Text style={styles.requestButtonText}>Request Info</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Reusable detail row
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={22} color="#FF6A5C" />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF5F3" },

  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginTop: 15,
    marginBottom: 10,
  },

  name: {
    fontSize: 24,
    color: "white",
    fontWeight: "700",
  },

  instrumentList: {
    color: "white",
    marginTop: 6,
    opacity: 0.9,
  },

  detailsSection: {
    padding: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },

  detailValue: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },

  requestButton: {
    marginTop: 25,
    borderRadius: 12,
    overflow: "hidden",
  },

  requestButtonGradient: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  requestButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  aboutText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 20,
  },
  
});
