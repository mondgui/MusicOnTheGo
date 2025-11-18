import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <View style={styles.container}>

      {/* Gradient Header */}
      <LinearGradient colors={['#FF9076', '#FF6A5C']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Reset Password</Text>
        <Text style={styles.headerSubtitle}>
          Enter your email to receive a reset link
        </Text>
      </LinearGradient>

      {/* Form Section */}
      <ScrollView contentContainerStyle={styles.formContainer}>

        {/* Email Input */}
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Send Reset Link</Text>
        </TouchableOpacity>

        {/* Footer */}
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.footerText}>
            Remember your password? <Text style={styles.footerLink}>Log in</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },

  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  backButton: { width: 40, marginBottom: 10 },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },

  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 5,
  },

  formContainer: { paddingHorizontal: 20, paddingVertical: 20 },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#F7F7F7',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 15,
  },

  submitButton: {
    backgroundColor: '#FF6A5C',
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 30,
    marginBottom: 15,
    alignItems: 'center',
  },

  submitText: { color: 'white', fontSize: 17, fontWeight: '700' },

  footerText: { textAlign: 'center', fontSize: 14, color: '#555' },

  footerLink: { color: '#FF6A5C', fontWeight: '600' },
});
