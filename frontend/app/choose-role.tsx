import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ChooseRole() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Peach Gradient Header */}
      <LinearGradient
        colors={['#FF9076', '#FF6A5C']}
        style={styles.header}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Welcome to MusicOnTheGo</Text>
        <Text style={styles.subtitle}>Choose your role to continue</Text>

        {/* Student Option */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => router.push('/register-student')}
        >
          <Ionicons name="school-outline" size={28} color="#FF6A5C" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.roleTitle}>I'm a Student</Text>
            <Text style={styles.roleDescription}>
              Find and book music lessons
            </Text>
          </View>
        </TouchableOpacity>

        {/* Teacher Option */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => router.push('/register-teacher')}
        >
          <Ionicons name="musical-notes-outline" size={28} color="#FF6A5C" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.roleTitle}>I'm a Music Teacher</Text>
            <Text style={styles.roleDescription}>
              Teach music and manage bookings
            </Text>
          </View>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  header: {
    height: 180,
    width: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  content: {
    marginTop: -40,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 50,
    color: '#333',
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
  },

  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },

  roleTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },

  roleDescription: {
    fontSize: 13,
    color: '#777',
  },

  backText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
    color: '#FF6A5C',
    fontWeight: '600',
  },
});
