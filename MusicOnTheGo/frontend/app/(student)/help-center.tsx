import React, { useState } from "react";
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
import { Separator } from "../../components/ui/separator";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function HelpCenterScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      id: 1,
      question: "Is my data private?",
      answer:
        "Yes! Your privacy is our top priority. We use industry-standard encryption to protect your data, and we never sell your personal information to third parties. Your data is only shared with teachers/students you connect with for lesson purposes. You can read our full Privacy Policy for complete details. You also have the right to delete your account and all associated data at any time.",
    },
    {
      id: 2,
      question: "How does this app work?",
      answer:
        "MusicOnTheGo connects music students with qualified teachers. Here's how it works:\n\n1. Create an account (as a student or teacher)\n2. Students: Search for teachers by instrument, location, and availability\n3. Students: Send an inquiry or book a lesson\n4. Teachers: Review requests and confirm bookings\n5. Both: Communicate through in-app messaging\n6. Track progress with practice logs, lesson notes, and skill badges\n7. Access learning resources, interactive tools (metronome, tuner), and more!\n\nTeachers can manage their schedule, view student portfolios, and send feedback. Students can track practice time, set goals, and earn achievements.",
    },
    {
      id: 3,
      question: "How do I book a lesson?",
      answer:
        "To book a lesson: Go to the Search tab → Browse or search for teachers → Tap on a teacher's profile → Review their availability, rates, and reviews → Tap 'Book Lesson' → Select your preferred date and time → Confirm booking. You'll receive a confirmation notification and the teacher will be notified of your request.",
    },
    {
      id: 4,
      question: "Can I cancel or reschedule a lesson?",
      answer:
        "Yes! Go to the Bookings tab → Find your upcoming lesson → Tap on it → Select 'Cancel' or 'Reschedule'. Please note that cancellation policies vary by teacher. We recommend reviewing each teacher's cancellation policy before booking. Generally, 24-48 hours notice is appreciated.",
    },
    {
      id: 5,
      question: "How do payments work?",
      answer:
        "Teachers set their own rates. Payment details are handled directly between students and teachers. We recommend discussing payment methods and schedules during your first lesson. For your safety, never share financial account passwords or credit card details through our messaging system.",
    },
    {
      id: 6,
      question: "What if I have a problem with a teacher or student?",
      answer:
        "We want everyone to have a positive experience. If you encounter an issue: 1) Try to communicate directly with the other person first, 2) If unresolved, contact our support team through Settings → Contact Us, 3) For serious safety concerns, report immediately. We take all reports seriously and will investigate promptly.",
    },
    {
      id: 7,
      question: "How do I track my practice and progress?",
      answer:
        "Students can use the Practice Log feature to record daily practice sessions. Teachers can add lesson notes and feedback after each lesson. You'll earn skill badges as you progress! Track your stats on your dashboard, including total practice time, streaks, and completed challenges.",
    },
    {
      id: 8,
      question: "What are the interactive tools?",
      answer:
        "We provide free built-in tools to support your music learning: Metronome (adjustable BPM and time signatures), Tuner (for tuning your instrument), and Music Theory Quizzes (to test your knowledge). Access these anytime from the Home screen or Tools section.",
    },
    {
      id: 9,
      question: "Can I have multiple teachers?",
      answer:
        "Absolutely! Many students learn multiple instruments or study with different teachers for various specialties. You can connect with as many teachers as you'd like, and all your lessons and communications will be organized in one place.",
    },
    {
      id: 10,
      question: "How do I update my profile or settings?",
      answer:
        "Go to Settings (bottom navigation) → Edit Profile to update your name, photo, bio, instruments, and other information. You can also change your password, notification preferences, and privacy settings from the Settings screen.",
    },
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
            <Ionicons name="help-circle" size={32} color="white" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Help Center</Text>
              <Text style={styles.headerSubtitle}>
                Frequently Asked Questions
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {faqs.map((faq) => (
            <Card key={faq.id} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleExpand(faq.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestion} numberOfLines={expandedId === faq.id ? undefined : 2}>
                  {faq.question}
                </Text>
                <Ionicons
                  name={expandedId === faq.id ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#FF6A5C"
                />
              </TouchableOpacity>

              {expandedId === faq.id && (
                <View style={styles.faqAnswerContainer}>
                  <Separator style={styles.faqSeparator} />
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
            </Card>
          ))}

          {/* Still Need Help */}
          <Card style={styles.helpCard}>
            <LinearGradient
              colors={["#FFE0D6", "#FFE5D9"]}
              style={styles.helpCardGradient}
            >
              <Text style={styles.helpCardTitle}>Still need help?</Text>
              <Text style={styles.helpCardText}>
                Can't find what you're looking for? Our support team is here to
                help!
              </Text>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => router.push("/(student)/contact-support")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#FF9076", "#FF6A5C"]}
                  style={styles.contactButtonGradient}
                >
                  <Text style={styles.contactButtonText}>Contact Support</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
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
    gap: 12,
  },
  faqCard: {
    padding: 0,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 12,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqSeparator: {
    marginBottom: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
  },
  helpCard: {
    padding: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFC4B0",
    marginTop: 8,
  },
  helpCardGradient: {
    padding: 24,
    borderRadius: 12,
  },
  helpCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  helpCardText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  contactButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contactButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
