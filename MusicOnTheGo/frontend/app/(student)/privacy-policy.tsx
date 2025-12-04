import React from "react";
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
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="shield" size={32} color="white" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Privacy & Security</Text>
              <Text style={styles.headerSubtitle}>
                Your data protection matters
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Last Updated */}
          <Text style={styles.lastUpdated}>
            Last updated: December 4, 2025
          </Text>

          {/* Introduction */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Introduction</Text>
            <Text style={styles.sectionText}>
              At MusicOnTheGo, we take your privacy seriously. This Privacy
              Policy explains how we collect, use, and protect your personal
              information when you use our music lesson booking platform.
            </Text>
          </Card>

          {/* Information We Collect */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Information We Collect</Text>
            <View style={styles.listSection}>
              <View style={styles.listItem}>
                <Text style={styles.listTitle}>Personal Information:</Text>
                <View style={styles.bulletList}>
                  <Text style={styles.bulletItem}>
                    • Name, email address, and phone number
                  </Text>
                  <Text style={styles.bulletItem}>
                    • Profile photo (optional)
                  </Text>
                  <Text style={styles.bulletItem}>
                    • Age group (for students)
                  </Text>
                  <Text style={styles.bulletItem}>
                    • Location and availability
                  </Text>
                </View>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.listTitle}>Musical Information:</Text>
                <View style={styles.bulletList}>
                  <Text style={styles.bulletItem}>
                    • Instruments you teach or learn
                  </Text>
                  <Text style={styles.bulletItem}>
                    • Skill level and learning goals
                  </Text>
                  <Text style={styles.bulletItem}>
                    • Practice logs and progress data
                  </Text>
                  <Text style={styles.bulletItem}>
                    • Lesson notes and recordings (with consent)
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* How We Use Your Information */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              How We Use Your Information
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>
                • To connect students with qualified music teachers
              </Text>
              <Text style={styles.bulletItem}>
                • To facilitate lesson bookings and scheduling
              </Text>
              <Text style={styles.bulletItem}>
                • To enable communication between teachers and students
              </Text>
              <Text style={styles.bulletItem}>
                • To track learning progress and provide feedback
              </Text>
              <Text style={styles.bulletItem}>
                • To send important notifications about lessons and bookings
              </Text>
              <Text style={styles.bulletItem}>
                • To improve our services and user experience
              </Text>
            </View>
          </Card>

          {/* Data Security */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Data Security</Text>
            <Text style={styles.sectionText}>
              We implement industry-standard security measures to protect your
              data:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>
                • Encrypted data transmission (SSL/TLS)
              </Text>
              <Text style={styles.bulletItem}>
                • Secure password storage with encryption
              </Text>
              <Text style={styles.bulletItem}>
                • Regular security audits and updates
              </Text>
              <Text style={styles.bulletItem}>
                • Limited employee access to personal data
              </Text>
              <Text style={styles.bulletItem}>
                • Secure cloud storage infrastructure
              </Text>
            </View>
          </Card>

          {/* Data Sharing */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Data Sharing</Text>
            <Text style={styles.sectionText}>
              We do NOT sell your personal information. We only share data in
              these limited circumstances:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>
                <Text style={styles.boldText}>With teachers/students:</Text>{" "}
                To facilitate lessons (name, contact info, availability)
              </Text>
              <Text style={styles.bulletItem}>
                <Text style={styles.boldText}>With service providers:</Text>{" "}
                Trusted partners who help operate our platform
              </Text>
              <Text style={styles.bulletItem}>
                <Text style={styles.boldText}>Legal requirements:</Text> When
                required by law or to protect user safety
              </Text>
            </View>
          </Card>

          {/* Your Rights */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Your Rights</Text>
            <Text style={styles.sectionText}>You have the right to:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Access your personal data</Text>
              <Text style={styles.bulletItem}>
                • Update or correct your information
              </Text>
              <Text style={styles.bulletItem}>
                • Delete your account and data
              </Text>
              <Text style={styles.bulletItem}>
                • Opt-out of marketing communications
              </Text>
              <Text style={styles.bulletItem}>
                • Export your data in a portable format
              </Text>
            </View>
          </Card>

          {/* Children's Privacy */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Children's Privacy</Text>
            <Text style={styles.sectionText}>
              For users under 18, we require parent/guardian consent. Parents
              have full access to view and manage their child's data. We do not
              knowingly collect data from children under 13 without verified
              parental consent.
            </Text>
          </Card>

          {/* Contact */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have questions about this Privacy Policy or how we handle
              your data, please contact us:
            </Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactItem}>
                <Text style={styles.boldText}>Email:</Text>{" "}
                privacy@musiconthego.com
              </Text>
              <Text style={styles.contactItem}>
                <Text style={styles.boldText}>Phone:</Text> +1 (800) 555-MUSIC
              </Text>
              <Text style={styles.contactItem}>
                <Text style={styles.boldText}>
                  Or use the Contact Us form in Settings
                </Text>
              </Text>
            </View>
          </Card>

          {/* Footer Note */}
          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              <Text style={styles.boldText}>Note:</Text> MusicOnTheGo is not
              intended for collecting sensitive personal information. Never
              share financial account details, passwords, or highly sensitive
              data through our platform.
            </Text>
          </View>

          {/* Delete Account */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Account Management</Text>
            <Text style={styles.sectionText}>
              If you wish to permanently delete your account and all associated
              data, you can do so below.
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                // TODO: Implement delete account functionality
                console.log("Delete account pressed");
              }}
            >
              <Text style={styles.deleteButtonText}>Delete My Account</Text>
            </TouchableOpacity>
            <Text style={styles.deleteWarning}>
              This action cannot be undone
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
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
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  backText: {
    color: "white",
    fontSize: 16,
    opacity: 0.9,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  lastUpdated: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
  },
  listSection: {
    gap: 16,
  },
  listItem: {
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  bulletList: {
    gap: 6,
    marginLeft: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "700",
  },
  contactInfo: {
    marginTop: 12,
    gap: 6,
  },
  contactItem: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  footerNote: {
    padding: 16,
    backgroundColor: "#FFE0D6",
    borderWidth: 1,
    borderColor: "#FFC4B0",
    borderRadius: 12,
    marginBottom: 16,
  },
  footerNoteText: {
    fontSize: 14,
    color: "#8B2E1F",
    textAlign: "center",
    lineHeight: 20,
  },
  deleteButton: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 10,
    marginTop: 16,
    alignItems: "center",
    backgroundColor: "white",
  },
  deleteButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  deleteWarning: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
});
