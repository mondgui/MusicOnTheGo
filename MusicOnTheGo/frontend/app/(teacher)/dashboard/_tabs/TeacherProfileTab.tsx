import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "../../../../lib/api";

type Props = {
  name?: string;
  email?: string;
  instruments?: string[];
  rate?: number;
  bio?: string; // This maps to 'about' in the backend
};

export default function TeacherProfileTab({ name, email, instruments, rate, bio }: Props) {
  const [formData, setFormData] = useState({
    name: name || "",
    instruments: instruments?.join(", ") || "",
    rate: rate?.toString() || "",
    bio: bio || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const instrumentsArray = formData.instruments
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      await api("/api/users/me", {
        method: "PUT",
        auth: true,
        body: {
          name: formData.name,
          instruments: instrumentsArray,
          rate: formData.rate ? parseFloat(formData.rate) : undefined,
          about: formData.bio, // Backend uses 'about' field
        },
      });

      alert("Profile updated successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.section}>
      <Card style={styles.profileCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="create-outline" size={20} color="#FF6A5C" />
          <Text style={styles.cardTitle}>Edit Profile</Text>
        </View>
        <View style={styles.form}>
          <View style={styles.formField}>
            <Label>Full Name</Label>
            <Input
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Your full name"
            />
          </View>
          <View style={styles.formField}>
            <Label>Instruments Taught</Label>
            <Input
              value={formData.instruments}
              onChangeText={(text) => setFormData({ ...formData, instruments: text })}
              placeholder="Piano, Guitar, Violin"
            />
          </View>
          <View style={styles.formField}>
            <Label>Hourly Rate ($)</Label>
            <Input
              value={formData.rate}
              onChangeText={(text) => setFormData({ ...formData, rate: text })}
              placeholder="45"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formField}>
            <Label>Bio</Label>
            <Textarea
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Tell students about your experience..."
              style={styles.bioInput}
            />
          </View>
          <Button onPress={handleSave} disabled={saving} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </Button>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  profileCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  form: {
    gap: 16,
  },
  formField: {
    gap: 8,
  },
  bioInput: {
    minHeight: 100,
  },
  saveButton: {
    width: "100%",
    marginTop: 8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
