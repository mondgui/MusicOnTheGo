import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Avatar } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Select, SelectItem } from "../../../../components/ui/select";

type Teacher = {
  _id: string;
  name: string;
  email: string;
  instruments: string[];
  experience: string;
  location: string;
  rate?: number;
  about?: string;
  specialties?: string[];
  profileImage?: string;
};

type HomeTabProps = {
  teachers: Teacher[];
  loading: boolean;
};

export default function HomeTab({ teachers, loading }: HomeTabProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstrument, setSelectedInstrument] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  // Filter teachers based on search and filters
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.instruments.some((inst) =>
        inst.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (teacher.location &&
        teacher.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesInstrument =
      selectedInstrument === "all" ||
      teacher.instruments.some(
        (inst) => inst.toLowerCase() === selectedInstrument.toLowerCase()
      );

    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "low" && (!teacher.rate || teacher.rate < 45)) ||
      (priceRange === "medium" &&
        teacher.rate &&
        teacher.rate >= 45 &&
        teacher.rate < 55) ||
      (priceRange === "high" && teacher.rate && teacher.rate >= 55);

    return matchesSearch && matchesInstrument && matchesPrice;
  });

  return (
    <View style={styles.section}>
      {/* Quick Access Cards */}
      <View style={styles.quickAccessRow}>
        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            router.push("/(student)/practice-log");
          }}
        >
          <Ionicons name="trending-up-outline" size={20} color="#FF6A5C" />
          <Text style={styles.quickAccessText}>Progress</Text>
        </Card>

        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            router.push("/(student)/resources");
          }}
        >
          <Ionicons name="book-outline" size={20} color="#FF9076" />
          <Text style={styles.quickAccessText}>Resources</Text>
        </Card>

        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            router.push("/(student)/practice-tools");
          }}
        >
          <Ionicons name="construct-outline" size={20} color="#4A90E2" />
          <Text style={styles.quickAccessText}>Tools</Text>
        </Card>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <Input
          placeholder="Search by instrument or name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <Card style={styles.filtersCard}>
        <View style={styles.filtersHeader}>
          <Ionicons name="filter-outline" size={16} color="#FF6A5C" />
          <Text style={styles.filtersTitle}>Filters</Text>
        </View>
        <View style={styles.filtersRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Instrument</Text>
            <Select
              value={selectedInstrument}
              onValueChange={setSelectedInstrument}
              placeholder="All"
            >
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Piano">Piano</SelectItem>
              <SelectItem value="Guitar">Guitar</SelectItem>
              <SelectItem value="Violin">Violin</SelectItem>
              <SelectItem value="Voice">Voice</SelectItem>
              <SelectItem value="Drums">Drums</SelectItem>
              <SelectItem value="Bass">Bass</SelectItem>
              <SelectItem value="Saxophone">Saxophone</SelectItem>
              <SelectItem value="Flute">Flute</SelectItem>
            </Select>
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Price Range</Text>
            <Select value={priceRange} onValueChange={setPriceRange} placeholder="All">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Under $45</SelectItem>
              <SelectItem value="medium">$45 - $55</SelectItem>
              <SelectItem value="high">$55+</SelectItem>
            </Select>
          </View>
        </View>
      </Card>

      {/* Teachers List */}
      <View style={styles.teachersHeader}>
        <Text style={styles.sectionTitle}>Available Teachers</Text>
        <Badge variant="default">{filteredTeachers.length} found</Badge>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6A5C" />
          <Text style={styles.loadingText}>Loading teachers...</Text>
        </View>
      )}

      {!loading && filteredTeachers.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>
            {teachers.length === 0
              ? "No teachers available yet. Check back soon."
              : "No teachers match your search criteria."}
          </Text>
        </View>
      )}

      {!loading &&
        filteredTeachers.map((teacher) => (
          <Card
            key={teacher._id}
            style={styles.teacherCard}
            onPress={() =>
              router.push(`/(student)/teacher/${teacher._id}` as Href)
            }
          >
            <View style={styles.teacherCardContent}>
              <Avatar
                src={teacher.profileImage}
                fallback={teacher.name.charAt(0)}
                size={64}
              />

              <View style={styles.teacherInfo}>
                <View>
                  <Text style={styles.cardTitle}>{teacher.name}</Text>
                  <Text style={styles.cardSubtitle}>
                    {teacher.instruments?.length
                      ? teacher.instruments.join(", ")
                      : "No instruments listed"}
                  </Text>
                </View>

                <View style={styles.teacherMeta}>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={styles.ratingText}>4.5</Text>
                    <Text style={styles.reviewsText}>(12)</Text>
                  </View>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={12} color="#666" />
                    <Text style={styles.locationText}>
                      {teacher.location
                        ? teacher.location.split(",")[0]
                        : "Location TBD"}
                    </Text>
                  </View>
                </View>

                {teacher.specialties && teacher.specialties.length > 0 && (
                  <View style={styles.specialtiesRow}>
                    {teacher.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge
                        key={index}
                        variant={index % 2 === 0 ? "default" : "warning"}
                        style={styles.specialtyBadge}
                      >
                        {specialty}
                      </Badge>
                    ))}
                    {teacher.specialties.length > 3 && (
                      <Text style={styles.moreSpecialtiesText}>
                        +{teacher.specialties.length - 3} more
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.teacherFooter}>
                  <Text style={styles.priceText}>
                    {teacher.rate ? `$${teacher.rate}/hour` : "Rate TBD"}
                  </Text>
                  <Button
                    size="sm"
                    onPress={() => {
                      router.push(`/(student)/teacher/${teacher._id}` as Href);
                    }}
                  >
                    View Profile
                  </Button>
                </View>
              </View>
            </View>
          </Card>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
  quickAccessRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  quickAccessCard: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    minHeight: 70,
    justifyContent: "center",
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
    textAlign: "center",
  },
  searchContainer: {
    position: "relative",
    marginBottom: 16,
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    marginTop: -10,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 40,
  },
  filtersCard: {
    marginBottom: 20,
  },
  filtersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  filtersRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  teachersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#777",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    color: "#777",
    textAlign: "center",
    fontSize: 14,
  },
  teacherCard: {
    marginBottom: 12,
  },
  teacherCardContent: {
    flexDirection: "row",
    gap: 16,
  },
  teacherInfo: {
    flex: 1,
    gap: 8,
  },
  teacherMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFB800",
  },
  reviewsText: {
    fontSize: 12,
    color: "#666",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#666",
  },
  specialtiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
    marginTop: 4,
  },
  specialtyBadge: {
    marginRight: 0,
  },
  moreSpecialtiesText: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
  teacherFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF6A5C",
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSubtitle: { color: "#777", marginTop: 3 },
});

