import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../lib/api";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";

type Contact = {
  id: number;
  name: string;
  role: "teacher" | "student";
  instrument: string;
  image: string;
  email: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  nextLesson?: { date: string; time: string };
};

export default function MessagesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user role
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await api("/api/users/me", { auth: true });
        setUserRole(user.role);
      } catch (err) {
        console.log("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // Mock contacts based on user role
  const contacts: Contact[] =
    userRole === "student"
      ? [
          {
            id: 1,
            name: "Sarah Mitchell",
            role: "teacher",
            instrument: "Piano",
            image:
              "https://images.unsplash.com/photo-1573333333693-f9f1917e0f61?w=400",
            email: "sarah.mitchell@musiconthego.com",
            phone: "+1 (415) 555-0123",
            lastMessage: "Great practice session today!",
            timestamp: "2 hours ago",
            unread: 2,
            nextLesson: { date: "Nov 15, 2025", time: "2:00 PM" },
          },
          {
            id: 2,
            name: "James Rodriguez",
            role: "teacher",
            instrument: "Guitar",
            image:
              "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400",
            email: "james.r@musiconthego.com",
            phone: "+1 (310) 555-0145",
            lastMessage: "Looking forward to our next lesson",
            timestamp: "Yesterday",
            unread: 0,
            nextLesson: { date: "Nov 18, 2025", time: "4:00 PM" },
          },
          {
            id: 3,
            name: "Emma Thompson",
            role: "teacher",
            instrument: "Piano",
            image:
              "https://images.unsplash.com/photo-1573333744553-25f91be191d6?w=400",
            email: "emma.t@musiconthego.com",
            phone: "+1 (415) 555-0198",
            lastMessage: "Remember to practice scales",
            timestamp: "3 days ago",
            unread: 0,
          },
        ]
      : [
          {
            id: 4,
            name: "Emily Johnson",
            role: "student",
            instrument: "Piano",
            image:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
            email: "emily.j@email.com",
            phone: "+1 (415) 555-0189",
            lastMessage: "Can we reschedule tomorrow's lesson?",
            timestamp: "1 hour ago",
            unread: 1,
            nextLesson: { date: "Nov 15, 2025", time: "2:00 PM" },
          },
          {
            id: 5,
            name: "Michael Chen",
            role: "student",
            instrument: "Guitar",
            image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
            email: "michael.chen@email.com",
            phone: "+1 (310) 555-0167",
            lastMessage: "Thanks for the lesson!",
            timestamp: "Yesterday",
            unread: 0,
            nextLesson: { date: "Nov 18, 2025", time: "4:00 PM" },
          },
          {
            id: 6,
            name: "Sarah Williams",
            role: "student",
            instrument: "Piano",
            image:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
            email: "sarah.w@email.com",
            phone: "+1 (415) 555-0134",
            lastMessage: "See you next week!",
            timestamp: "2 days ago",
            unread: 0,
          },
        ];

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.instrument.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectContact = (contact: Contact) => {
    // Navigate to chat detail screen (to be implemented)
    console.log("Selected contact:", contact);
    // router.push({ pathname: "/chat/[id]", params: { contactId: contact.id } });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Messages</Text>
              <Text style={styles.headerSubtitle}>
                {userRole === "student"
                  ? "Chat with your teachers"
                  : "Chat with your students"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>

          {/* Contacts List */}
          <View style={styles.contactsList}>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <Card
                  key={contact.id}
                  style={styles.contactCard}
                  onPress={() => handleSelectContact(contact)}
                >
                  <View style={styles.contactContent}>
                    <View style={styles.avatarContainer}>
                      <Avatar size={56}>
                        <AvatarImage src={contact.image} />
                        <AvatarFallback>
                          {contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {contact.unread > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>
                            {contact.unread > 9 ? "9+" : contact.unread}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.contactInfo}>
                      <View style={styles.contactHeader}>
                        <View style={styles.contactNameContainer}>
                          <Text style={styles.contactName} numberOfLines={1}>
                            {contact.name}
                          </Text>
                          <Text style={styles.contactInstrument}>
                            {contact.instrument}
                          </Text>
                        </View>
                        <Text style={styles.timestamp}>{contact.timestamp}</Text>
                      </View>
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {contact.lastMessage}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color="#CCC"
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No contacts found</Text>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchContainer: {
    position: "relative",
    marginBottom: 20,
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 40,
  },
  contactsList: {
    gap: 12,
  },
  contactCard: {
    padding: 16,
  },
  contactContent: {
    flexDirection: "row",
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  unreadText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  contactInfo: {
    flex: 1,
    minWidth: 0,
  },
  contactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  contactNameContainer: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  contactInstrument: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  emptyCard: {
    padding: 48,
    alignItems: "center",
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

