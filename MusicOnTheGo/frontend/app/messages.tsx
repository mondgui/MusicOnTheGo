import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { api } from "../lib/api";
import { initSocket, getSocket } from "../lib/socket";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import type { Socket } from "socket.io-client";

type Contact = {
  id: string;
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

type Inquiry = {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  instrument: string;
  level: string;
  ageGroup?: string;
  lessonType: string;
  availability: string;
  message?: string;
  goals?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  status: "sent" | "read" | "responded";
  createdAt: string;
};

export default function MessagesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);
  const [loading, setLoading] = useState(true);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // Function to load contacts from bookings and messages
  const loadContacts = useCallback(async () => {
    try {
      const user = await api("/api/users/me", { auth: true });
      setUserRole(user.role);
      currentUserIdRef.current = user._id || user.id;
      
      const contactsMap = new Map<string, Contact>();
      
      // Load conversations from messages
      try {
        const conversations = await api("/api/messages/conversations", { auth: true });
        (Array.isArray(conversations) ? conversations : []).forEach((conv: any) => {
          const contactId = conv.userId;
          const role = user.role === "teacher" ? "student" : "teacher";
          
          contactsMap.set(contactId, {
            id: contactId,
            name: conv.name || "Contact",
            role: role,
            instrument: "Music", // Default, can be updated from bookings
            image: conv.profileImage || "",
            email: conv.email || "",
            phone: "",
            lastMessage: conv.lastMessage || "No messages yet",
            timestamp: conv.lastMessageTime || new Date().toISOString(),
            unread: conv.unreadCount || 0,
          });
        });
      } catch (err) {
        console.log("Error loading conversations:", err);
      }
      
      // Load contacts from bookings and merge
      if (user.role === "teacher") {
        try {
          const bookings = await api("/api/bookings/teacher/me", { auth: true });
          
          (Array.isArray(bookings) ? bookings : []).forEach((booking: any) => {
            if (booking.student) {
              const studentId = booking.student._id 
                ? String(booking.student._id) 
                : String(booking.student);
              
              const student = booking.student._id ? booking.student : { _id: booking.student, name: "Student", email: "" };
              
              // If contact already exists from messages, update it; otherwise create new
              if (contactsMap.has(studentId)) {
                const existing = contactsMap.get(studentId)!;
                existing.instrument = booking.instrument || existing.instrument || "Music";
                existing.nextLesson = booking.date ? { date: booking.date, time: booking.time } : existing.nextLesson;
                // Preserve image from messages, but use booking image if messages didn't have one
                if (!existing.image && student.profileImage) {
                  existing.image = student.profileImage;
                }
              } else {
                contactsMap.set(studentId, {
                  id: studentId,
                  name: student.name || "Student",
                  role: "student" as const,
                  instrument: booking.instrument || "Music",
                  image: student.profileImage || "",
                  email: student.email || "",
                  phone: student.phone || "",
                  lastMessage: "No messages yet",
                  timestamp: booking.date || "",
                  unread: 0,
                  nextLesson: booking.date ? { date: booking.date, time: booking.time } : undefined,
                });
              }
            }
          });
        } catch (err) {
          console.log("Error loading bookings:", err);
        }
      } else if (user.role === "student") {
        try {
          const bookings = await api("/api/bookings/student/me", { auth: true });
          
          (Array.isArray(bookings) ? bookings : []).forEach((booking: any) => {
            if (booking.teacher) {
              const teacherId = booking.teacher._id 
                ? String(booking.teacher._id) 
                : String(booking.teacher);
              
              const teacher = booking.teacher._id ? booking.teacher : { _id: booking.teacher, name: "Teacher", email: "" };
              
              // If contact already exists from messages, update it; otherwise create new
              if (contactsMap.has(teacherId)) {
                const existing = contactsMap.get(teacherId)!;
                existing.instrument = booking.instrument || existing.instrument || "Music";
                existing.nextLesson = booking.date ? { date: booking.date, time: booking.time } : existing.nextLesson;
                // Preserve image from messages, but use booking image if messages didn't have one
                if (!existing.image && teacher.profileImage) {
                  existing.image = teacher.profileImage;
                }
              } else {
                contactsMap.set(teacherId, {
                  id: teacherId,
                  name: teacher.name || "Teacher",
                  role: "teacher" as const,
                  instrument: booking.instrument || "Music",
                  image: teacher.profileImage || "",
                  email: teacher.email || "",
                  phone: teacher.phone || "",
                  lastMessage: "No messages yet",
                  timestamp: booking.date || "",
                  unread: 0,
                  nextLesson: booking.date ? { date: booking.date, time: booking.time } : undefined,
                });
              }
            }
          });
        } catch (err) {
          console.log("Error loading bookings:", err);
        }
      }
      
      // Sort contacts by last message time (most recent first)
      const sortedContacts = Array.from(contactsMap.values()).sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
      
      setContacts(sortedContacts);
    } catch (err) {
      console.log("Error loading user/contacts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize Socket.io connection for real-time updates
  useEffect(() => {
    let mounted = true;
    let socketInstance: Socket | null = null;

    async function setupSocket() {
      try {
        socketInstance = await initSocket();
        if (socketInstance && mounted) {
          setSocket(socketInstance);

          // Remove any existing listeners to avoid duplicates
          socketInstance.removeAllListeners("message-notification");
          socketInstance.removeAllListeners("new-message");

          // Listen for message notifications (includes unread count)
          socketInstance.on("message-notification", (data: any) => {
            if (mounted && data && data.message) {
              const message = data.message;
              const senderId = message.sender?._id || message.sender || "";
              const unreadCount = data.unreadCount || 0;

              // Update the contact in the list
              setContacts((prevContacts) => {
                const updated = prevContacts.map((contact) => {
                  // If this message is from this contact
                  if (contact.id === senderId) {
                    return {
                      ...contact,
                      lastMessage: message.text || contact.lastMessage,
                      timestamp: message.createdAt || contact.timestamp,
                      unread: unreadCount,
                    };
                  }
                  return contact;
                });

                // If contact doesn't exist in list, we might need to reload
                // But for now, just update existing ones
                const contactExists = updated.some((c) => c.id === senderId);
                if (!contactExists) {
                  // Contact not in list, reload to get it
                  setTimeout(() => {
                    if (mounted) loadContacts();
                  }, 500);
                }

                // Sort by timestamp (most recent first)
                return updated.sort((a, b) => {
                  const timeA = new Date(a.timestamp).getTime();
                  const timeB = new Date(b.timestamp).getTime();
                  return timeB - timeA;
                });
              });

              console.log("[Messages] Updated unread count for:", senderId, "unread:", unreadCount);
            }
          });

          // Also listen for new-message events (for both sender and recipient)
          socketInstance.on("new-message", (newMessage: any) => {
            if (mounted && newMessage) {
              const senderId = newMessage.sender?._id || newMessage.sender || "";
              const recipientId = newMessage.recipient?._id || newMessage.recipient || "";
              const currentUserId = currentUserIdRef.current;

              setContacts((prevContacts) => {
                let updated = [...prevContacts];
                let needsSort = false;

                // Update recipient's conversation (if current user is the sender)
                if (senderId && currentUserId && String(senderId) === String(currentUserId) && recipientId) {
                  updated = updated.map((contact) => {
                    if (contact.id === recipientId) {
                      needsSort = true;
                      return {
                        ...contact,
                        lastMessage: newMessage.text || contact.lastMessage,
                        timestamp: newMessage.createdAt || contact.timestamp,
                        // Don't increment unread for messages you sent
                      };
                    }
                    return contact;
                  });
                }

                // Update sender's conversation (if current user is the recipient)
                if (senderId && currentUserId && String(senderId) !== String(currentUserId) && recipientId === currentUserId) {
                  updated = updated.map((contact) => {
                    if (contact.id === senderId) {
                      needsSort = true;
                      return {
                        ...contact,
                        lastMessage: newMessage.text || contact.lastMessage,
                        timestamp: newMessage.createdAt || contact.timestamp,
                        unread: (contact.unread || 0) + 1, // Increment unread count
                      };
                    }
                    return contact;
                  });
                }

                // Sort by timestamp if any updates were made
                if (needsSort) {
                  return updated.sort((a, b) => {
                    const timeA = new Date(a.timestamp).getTime();
                    const timeB = new Date(b.timestamp).getTime();
                    return timeB - timeA;
                  });
                }

                return updated;
              });
            }
          });

          socketInstance.on("error", (error: any) => {
            console.error("[Messages] Socket error:", error);
          });
        }
      } catch (error) {
        console.error("[Messages] Failed to initialize socket:", error);
      }
    }

    setupSocket();

    return () => {
      mounted = false;
      if (socketInstance) {
        socketInstance.removeAllListeners("message-notification");
        socketInstance.removeAllListeners("new-message");
        socketInstance.removeAllListeners("error");
      }
    };
  }, []);

  // Load user role and contacts
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Refresh contacts when screen comes into focus (e.g., after sending a message)
  useFocusEffect(
    useCallback(() => {
      if (userRole) {
        loadContacts();
      }
    }, [userRole, loadContacts])
  );

  // Function to load inquiries
  const loadInquiries = useCallback(async () => {
    if (userRole !== "teacher") return;
    
    try {
      setInquiriesLoading(true);
      const data = await api("/api/inquiries/teacher/me", { auth: true });
      const inquiriesList = Array.isArray(data) ? data : [];
      // Sort by createdAt descending (newest first)
      inquiriesList.sort((a: Inquiry, b: Inquiry) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Newest first
      });
      setInquiries(inquiriesList);
    } catch (err) {
      console.log("Error loading inquiries:", err);
    } finally {
      setInquiriesLoading(false);
    }
  }, [userRole]);

  // Load inquiries for teachers
  useEffect(() => {
    if (userRole === "teacher") {
      loadInquiries();
    }
  }, [userRole, loadInquiries]);

  // Refresh inquiries when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userRole === "teacher") {
        loadInquiries();
      }
    }, [userRole, loadInquiries])
  );

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.instrument.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectContact = (contact: Contact) => {
    router.push({
      pathname: "/chat/[id]",
      params: { 
        id: contact.id,
        contactName: contact.name,
        contactRole: contact.role,
      },
    });
  };

  const handleContactStudent = async (inquiry: Inquiry) => {
    try {
      // Mark inquiry as "read" when teacher clicks to contact student
      if (inquiry.status === "sent") {
        await api(`/api/inquiries/${inquiry._id}/read`, {
          method: "PUT",
          auth: true,
        });
        
        // Update local state immediately
        setInquiries((prev) =>
          prev.map((inq) =>
            inq._id === inquiry._id ? { ...inq, status: "read" as const } : inq
          )
        );
      }
    } catch (err) {
      console.log("Error marking inquiry as read:", err);
    }

    router.push({
      pathname: "/chat/[id]",
      params: { 
        id: inquiry.student._id,
        contactName: inquiry.student.name,
        contactRole: "student",
        fromInquiry: "true",
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6A5C" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
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
          colors={["#FF9076", "#FF6A5C"]}
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
          {/* Tabs for Teachers */}
          {userRole === "teacher" && (
            <Tabs defaultValue="conversations">
              <TabsList style={styles.tabsList}>
                <TabsTrigger value="conversations">
                  <Text style={styles.tabText}>Conversations</Text>
                </TabsTrigger>
                <TabsTrigger value="inquiries">
                  <View style={styles.tabTriggerContent}>
                    <Text style={styles.tabText}>Inquiries</Text>
                    {inquiries.filter((inq) => inq.status === "sent").length > 0 && (
                      <Badge style={styles.inquiryBadge}>
                        {inquiries.filter((inq) => inq.status === "sent").length}
                      </Badge>
                    )}
                  </View>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conversations">
                <ConversationsTab
                  contacts={filteredContacts}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSelectContact={handleSelectContact}
                  userRole={userRole}
                />
              </TabsContent>

              <TabsContent value="inquiries">
                <InquiriesTabContent
                  inquiries={inquiries}
                  loading={inquiriesLoading}
                  onContactStudent={handleContactStudent}
                  formatDate={formatDate}
                />
              </TabsContent>
            </Tabs>
          )}

          {/* No tabs for Students */}
          {userRole === "student" && (
            <ConversationsTab
              contacts={filteredContacts}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectContact={handleSelectContact}
              userRole={userRole}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Conversations Tab Component
type ConversationsTabProps = {
  contacts: Contact[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectContact: (contact: Contact) => void;
  userRole: "teacher" | "student" | null;
};

function ConversationsTab({
  contacts,
  searchQuery,
  setSearchQuery,
  onSelectContact,
  userRole,
}: ConversationsTabProps) {
  return (
    <>
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
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <Card
              key={contact.id}
              style={styles.contactCard}
              onPress={() => onSelectContact(contact)}
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
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>
              {userRole === "student"
                ? "Book a lesson with a teacher to start messaging"
                : "Students who book lessons with you will appear here"}
            </Text>
          </Card>
        )}
      </View>
    </>
  );
}

// Inquiries Tab Content Component
type InquiriesTabContentProps = {
  inquiries: Inquiry[];
  loading: boolean;
  onContactStudent: (inquiry: Inquiry) => void;
  formatDate: (date: string) => string;
};

function InquiriesTabContent({
  inquiries,
  loading,
  onContactStudent,
  formatDate,
}: InquiriesTabContentProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A5C" />
        <Text style={styles.loadingText}>Loading inquiries...</Text>
      </View>
    );
  }

  if (inquiries.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Ionicons
          name="mail-outline"
          size={48}
          color="#CCC"
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyText}>No inquiries yet</Text>
        <Text style={styles.emptySubtext}>
          When students contact you, their inquiries will appear here
        </Text>
      </Card>
    );
  }

  return (
    <ScrollView style={styles.inquiriesList} showsVerticalScrollIndicator={false}>
      {inquiries.map((inquiry) => (
        <Card key={inquiry._id} style={styles.inquiryCard}>
          <View style={styles.inquiryHeader}>
            <View style={styles.inquiryInfo}>
              <Text style={styles.studentName}>
                {inquiry.student?.name || "Student"}
              </Text>
              <Text style={styles.studentEmail}>
                {inquiry.student?.email || ""}
              </Text>
            </View>
            <Badge
              variant={
                inquiry.status === "responded"
                  ? "success"
                  : inquiry.status === "read"
                  ? "secondary"
                  : "warning"
              }
            >
                 {inquiry.status === "sent" ? "New" : inquiry.status === "read" ? "Read" : "Responded"}
            </Badge>
          </View>

          <View style={styles.inquiryDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="musical-notes-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {inquiry.instrument} - {inquiry.level}
              </Text>
            </View>
            {inquiry.ageGroup && (
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{inquiry.ageGroup}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{inquiry.lessonType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{inquiry.availability}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>
                Received: {formatDate(inquiry.createdAt)}
              </Text>
            </View>
          </View>

          {/* Message */}
          <View style={styles.messageSection}>
            <Text style={styles.messageLabel}>Message:</Text>
            <Text style={styles.messageText}>
              {inquiry.message || "No message provided"}
            </Text>
          </View>

          {/* Goals / Interests */}
          {inquiry.goals && (
            <View style={styles.messageSection}>
              <Text style={styles.messageLabel}>Goals / Interests:</Text>
              <Text style={styles.messageText}>{inquiry.goals}</Text>
            </View>
          )}

          {/* Parent/Guardian Info */}
          {(inquiry.guardianName || inquiry.guardianPhone || inquiry.guardianEmail) && (
            <View style={styles.guardianSection}>
              <Text style={styles.sectionTitle}>Parent/Guardian Contact</Text>
              {inquiry.guardianName && (
                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Name: </Text>
                    {inquiry.guardianName}
                  </Text>
                </View>
              )}
              {inquiry.guardianPhone && (
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Phone: </Text>
                    {inquiry.guardianPhone}
                  </Text>
                </View>
              )}
              {inquiry.guardianEmail && (
                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Email: </Text>
                    {inquiry.guardianEmail}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.actionsRow}>
            <Button
              size="sm"
              onPress={() => onContactStudent(inquiry)}
              style={styles.contactButton}
            >
              Contact {inquiry.student?.name || "Student"}
            </Button>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F3",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
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
  tabsList: {
    marginBottom: 20,
  },
  tabTriggerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  inquiryBadge: {
    marginLeft: 0,
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
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  inquiriesList: {
    maxHeight: 600,
  },
  inquiryCard: {
    padding: 16,
    marginBottom: 12,
  },
  inquiryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  inquiryInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: "#666",
  },
  inquiryDetails: {
    marginTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  messageSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  guardianSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: "600",
    color: "#333",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  contactButton: {
    minWidth: 180,
  },
});
