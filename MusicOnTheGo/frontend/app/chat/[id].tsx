import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { api } from "../../lib/api";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  timestamp: Date;
  isOwn: boolean;
};

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const contactId = params.id as string;
  const contactName = params.contactName as string || "Contact";
  const contactRole = params.contactRole as string;
  const fromInquiry = params.fromInquiry === "true";

  // Suggested message when coming from inquiry
  const suggestedMessage = "Hello, I received your inquiry. How can I help you?";
  
  const [message, setMessage] = useState(fromInquiry ? suggestedMessage : "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Function to load messages
  const loadMessages = useCallback(async () => {
    if (!contactId || !currentUserId) return;

    try {
      // Load messages from backend
      const messagesData = await api(`/api/messages/conversation/${contactId}`, { auth: true });
      const messagesList = Array.isArray(messagesData) ? messagesData : [];
      
      const formattedMessages: Message[] = messagesList.map((msg: any) => ({
        id: msg._id,
        text: msg.text,
        senderId: msg.sender._id || msg.sender,
        senderName: msg.sender.name || "Unknown",
        senderImage: msg.sender.profileImage || "",
        timestamp: new Date(msg.createdAt),
        isOwn: String(msg.sender._id || msg.sender) === String(currentUserId),
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.log("Error loading messages:", err);
    }
  }, [contactId, currentUserId, fromInquiry]);

  // Load current user and contact info
  useEffect(() => {
    async function loadData() {
      try {
        const user = await api("/api/users/me", { auth: true });
        setCurrentUserId(user._id || user.id);

        // Load contact info
        try {
          const contactData = await api(`/api/users/${contactId}`, { auth: true });
          setContact(contactData);
        } catch (err) {
          console.log("Error loading contact info:", err);
          // Set contact with minimal info if API fails
          setContact({ name: contactName, _id: contactId });
        }
      } catch (err) {
        console.log("Error loading chat data:", err);
      }
    }
    loadData();
  }, [contactId, contactName]);

  // Load messages when currentUserId is available
  useEffect(() => {
    if (currentUserId) {
      loadMessages();
    }
  }, [currentUserId, loadMessages]);

  // Refresh messages when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        loadMessages();
      }
    }, [currentUserId, loadMessages])
  );

  const handleSend = async () => {
    if (!message.trim() || !currentUserId) return;

    const messageText = message.trim();
    setMessage(""); // Clear input immediately for better UX

    // Optimistically add message to UI
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text: messageText,
      senderId: currentUserId,
      senderName: "You",
      senderImage: "",
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages((prev) => [...prev, tempMessage]);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Send message to backend
      const savedMessage = await api("/api/messages", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          recipientId: contactId,
          text: messageText,
        }),
      });

      // Replace temp message with saved message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id
            ? {
                id: savedMessage._id,
                text: savedMessage.text,
                senderId: savedMessage.sender._id || savedMessage.sender,
                senderName: savedMessage.sender.name || "You",
                senderImage: savedMessage.sender.profileImage || "",
                timestamp: new Date(savedMessage.createdAt),
                isOwn: true,
              }
            : msg
        )
      );
    } catch (err) {
      console.log("Error sending message:", err);
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      // Restore message text
      setMessage(messageText);
      alert("Failed to send message. Please try again.");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Avatar size={40}>
              <AvatarImage src={contact?.profileImage} />
              <AvatarFallback>
                {contactName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <View style={styles.headerText}>
              <Text style={styles.headerName}>{contactName}</Text>
              <Text style={styles.headerRole}>
                {contactRole === "student" ? "Student" : "Teacher"}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Ionicons name="shield-checkmark-outline" size={18} color="#FF6A5C" />
        <Text style={styles.securityText}>
          <Text style={styles.securityBold}>Security Notice:</Text> This chat is for music-related purposes only. Please be cautious, vigilant, and report any inappropriate behavior immediately.
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start the conversation by sending a message
            </Text>
          </View>
        ) : (
          messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.isOwn ? styles.ownMessage : styles.otherMessage,
              ]}
            >
              {!msg.isOwn && (
                <View style={styles.messageHeader}>
                  <Avatar size={24} style={styles.messageAvatar}>
                    <AvatarImage src={msg.senderImage} />
                    <AvatarFallback>
                      {msg.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Text style={styles.senderName}>{msg.senderName}</Text>
                </View>
              )}
              <Text
                style={[
                  styles.messageText,
                  msg.isOwn ? styles.ownMessageText : styles.otherMessageText,
                ]}
              >
                {msg.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  msg.isOwn ? styles.ownMessageTime : styles.otherMessageTime,
                ]}
              >
                {formatTime(msg.timestamp)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={message.trim() ? "white" : "#999"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F3",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  headerRole: {
    fontSize: 14,
    color: "white",
    opacity: 0.8,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FFE0B2",
    gap: 10,
    minHeight: 50,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: "#E65100",
    lineHeight: 18,
  },
  securityBold: {
    fontWeight: "700",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FF6A5C",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  messageAvatar: {
    marginRight: 0,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: "white",
  },
  otherMessageText: {
    color: "#333",
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  ownMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  otherMessageTime: {
    color: "#999",
  },
  inputContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFF5F3",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF6A5C",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#E5E5E5",
  },
});

