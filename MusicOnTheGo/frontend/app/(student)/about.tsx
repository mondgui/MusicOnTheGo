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

export default function AboutScreen() {
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
            <Ionicons name="musical-notes" size={32} color="white" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>About MusicOnTheGo</Text>
              <Text style={styles.headerSubtitle}>Our story and mission</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Our Mission */}
          <Card style={styles.missionCard}>
            <LinearGradient
              colors={["#FFE0D6", "#FFE5D9"]}
              style={styles.missionCardGradient}
            >
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={["#FF9076", "#FF6A5C"]}
                  style={styles.iconCircle}
                >
                  <Ionicons name="locate" size={24} color="white" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Our Mission</Text>
              </View>
              <Text style={styles.sectionText}>
                At MusicOnTheGo, we believe that music education should be
                accessible, affordable, and enjoyable for everyone. Our mission
                is to connect passionate music students with talented teachers,
                making it easier than ever to discover the joy of learning music.
              </Text>
            </LinearGradient>
          </Card>

          {/* What We Do */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconCircleRose}>
                <Ionicons name="people" size={24} color="#FF6A5C" />
              </View>
              <Text style={styles.sectionTitle}>What We Do</Text>
            </View>
            <Text style={styles.sectionText}>
              We've built a platform that brings music education into the modern
              age. Whether you're a complete beginner or an advanced musician,
              MusicOnTheGo helps you find the perfect teacher, track your
              progress, and achieve your musical goals.
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  Connect students with qualified music teachers
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  Provide tools for practice tracking and progress monitoring
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  Offer free learning resources and interactive tools
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  Create a safe, supportive community for music learners
                </Text>
              </View>
            </View>
          </Card>

          {/* Our Values */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconCircleOrange}>
                <Ionicons name="trophy" size={24} color="#FF9076" />
              </View>
              <Text style={styles.sectionTitle}>Our Values</Text>
            </View>
            <View style={styles.valuesList}>
              <View style={styles.valueItem}>
                <Text style={styles.valueTitle}>Accessibility</Text>
                <Text style={styles.valueText}>
                  Music education should be available to everyone, regardless of
                  location or background.
                </Text>
              </View>
              <View style={styles.valueItem}>
                <Text style={styles.valueTitle}>Quality</Text>
                <Text style={styles.valueText}>
                  We connect students with verified, passionate teachers who
                  care about their progress.
                </Text>
              </View>
              <View style={styles.valueItem}>
                <Text style={styles.valueTitle}>Safety</Text>
                <Text style={styles.valueText}>
                  Your privacy and security are our top priorities. We maintain a
                  safe learning environment.
                </Text>
              </View>
              <View style={styles.valueItem}>
                <Text style={styles.valueTitle}>Innovation</Text>
                <Text style={styles.valueText}>
                  We continuously improve our platform with features that enhance
                  the learning experience.
                </Text>
              </View>
            </View>
          </Card>

          {/* Thank You */}
          <Card style={styles.thankYouCard}>
            <LinearGradient
              colors={["#FFE5D9", "#FFE0D6"]}
              style={styles.thankYouGradient}
            >
              <LinearGradient
                colors={["#FF9076", "#FF6A5C"]}
                style={styles.heartIconCircle}
              >
                <Ionicons name="heart" size={32} color="white" />
              </LinearGradient>
              <Text style={styles.thankYouTitle}>Thank You!</Text>
              <Text style={styles.thankYouText}>
                Thank you for choosing MusicOnTheGo as your music learning
                companion. Whether you're a student discovering a new instrument
                or a teacher sharing your passion, you're part of our growing
                community.
              </Text>
              <Text style={styles.thankYouText}>
                Together, we're making music education more accessible, engaging,
                and enjoyable. Keep practicing, keep learning, and keep making
                beautiful music! 🎵
              </Text>
            </LinearGradient>
          </Card>

          {/* App Info */}
          <Card style={styles.appInfoCard}>
            <View style={styles.appInfo}>
              <Text style={styles.appInfoText}>
                <Text style={styles.appInfoBold}>MusicOnTheGo</Text>
              </Text>
              <Text style={styles.appInfoText}>Version 1.0.0</Text>
              <Text style={styles.appInfoCopyright}>
                © 2025 MusicOnTheGo. All rights reserved.
              </Text>
            </View>
          </Card>

          {/* Contact */}
          <View style={styles.contactSection}>
            <Text style={styles.contactText}>Questions or feedback?</Text>
            <Text style={styles.contactEmail}>support@musiconthego.com</Text>
          </View>
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
    gap: 16,
  },
  missionCard: {
    padding: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFC4B0",
  },
  missionCardGradient: {
    padding: 24,
    borderRadius: 12,
  },
  sectionCard: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleRose: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFE0D6",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleOrange: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFE5D9",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  sectionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    gap: 8,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#FF6A5C",
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  valuesList: {
    gap: 16,
  },
  valueItem: {
    marginBottom: 4,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  valueText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  thankYouCard: {
    padding: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFC4B0",
  },
  thankYouGradient: {
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  heartIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  thankYouTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  thankYouText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 8,
  },
  appInfoCard: {
    padding: 16,
  },
  appInfo: {
    alignItems: "center",
    gap: 4,
  },
  appInfoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  appInfoBold: {
    fontWeight: "700",
  },
  appInfoCopyright: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
  },
  contactSection: {
    alignItems: "center",
    gap: 4,
    paddingBottom: 16,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  contactEmail: {
    fontSize: 14,
    color: "#FF6A5C",
    textAlign: "center",
  },
});
