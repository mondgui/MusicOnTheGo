

import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

type Message = {
  id: number;
  student: string;
  instrument: string;
  preview: string;
  time: string;
  unread: boolean;
  photo: string;
};

type Props = { messages: Message[] };

export default function MessagesTab({ messages }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Messages</Text>

      {messages.map((msg) => (
        <View key={msg.id} style={styles.messageCard}>
          <Image source={{ uri: msg.photo }} style={styles.messageAvatar} />

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{msg.student}</Text>
            <Text style={styles.cardSubtitle}>{msg.instrument}</Text>
            <Text style={styles.messagePreview}>{msg.preview}</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.timeText}>{msg.time}</Text>
            {msg.unread && <View style={styles.unreadDot} />}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
  messageCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    gap: 12,
    alignItems: "center",
  },
  messageAvatar: { width: 50, height: 50, borderRadius: 25 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSubtitle: { color: "#777", marginTop: 2 },
  messagePreview: { color: "#777", marginTop: 4, fontSize: 14 },
  timeText: { color: "#999", fontSize: 12 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6A5C",
    marginTop: 4,
  },
});
