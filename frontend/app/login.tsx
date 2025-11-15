import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

<Ionicons name="log-in-outline" size={32} color="white" style={{ alignSelf: 'center', marginBottom: 10 }} />


export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>

      {/* Gradient Header */}
      <LinearGradient colors={['#FF9076', '#FF6A5C']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Log In</Text>
        <Text style={styles.headerSubtitle}>
        Access your MusicOnTheGo account
        </Text>
      </LinearGradient>

      {/* Form Section */}
      <ScrollView contentContainerStyle={styles.formContainer}>

        {/* Email */}
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password */}
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Forgot password */}
        <TouchableOpacity onPress={() => router.push('/forgot-password')}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Log In</Text>
        </TouchableOpacity>

        {/* Footer */}
        <TouchableOpacity onPress={() => router.push('/choose-role')}>
          <Text style={styles.footerText}>
            Don’t have an account? <Text style={styles.footerLink}>Create one</Text>
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

  backButton: {
    marginBottom: 10,
    width: 40,
  },

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

  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

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
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  forgotText: {
    marginTop: 10,
    textAlign: 'right',
    color: '#FF6A5C',
    fontWeight: '600',
  },

  submitButton: {
    backgroundColor: '#FF6A5C',
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 30,
    marginBottom: 15,
    alignItems: 'center',
  },

  submitText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },

  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },

  footerLink: {
    color: '#FF6A5C',
    fontWeight: '600',
  },
});
console.log("LOGIN SCREEN LOADED");
