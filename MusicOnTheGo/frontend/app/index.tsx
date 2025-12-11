// This file is the entry point for the app. 
// It is the first screen that the user sees.
// It displays a welcome message and a button to get started.
// It also displays a link to the login screen.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#FF9076', '#FF6A5C']}
      style={styles.container}
    >
      {/* Center section */}
      <View style={styles.centerBox}>
        <View style={styles.iconCircle}>
          <Ionicons name="musical-note" size={60} color="white" />
        </View>
        <Text style={styles.title}>MusicOnTheGo</Text>
        <Text style={styles.subtitle}>
        Learn. Teach. Connect.{"\n"}
        Find your music teacher or student.
        </Text>
      </View>

      {/* Get Started button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/role-selection')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.loginLink}>
        Already have an account? <Text style={styles.loginLinkHighlight}>Log in</Text>
        </Text>
      </TouchableOpacity>


    </LinearGradient>
  );
}
     

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 100,
    paddingHorizontal: 30,
  },

  centerBox: {
    alignItems: 'center',
    marginTop: 40,
  },

  iconCircle: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 50,
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    lineHeight: 22,
  },

  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 30,
    ...Platform.select({
      web: { boxShadow: '0px 3px 5px rgba(0,0,0,0.2)' },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
      },
    }),
  },

  buttonText: {
    color: '#FF6A5C',
    fontSize: 18,
    fontWeight: '600',
  },

  loginLink: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: 'white',
  },
  
  loginLinkHighlight: {
    fontWeight: '700',
    color: 'white',
    textDecorationLine: 'underline',
  },

});
