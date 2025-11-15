import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import RNPickerSelect from "react-native-picker-select";

const instruments = [
  { label: "Piano", value: "piano" },
  { label: "Guitar", value: "guitar" },
  { label: "Violin", value: "violin" },
  { label: "Voice / Singing", value: "voice" },
  { label: "Drums", value: "drums" },
  { label: "Bass", value: "bass" },
  { label: "Saxophone", value: "saxophone" },
  { label: "Flute", value: "flute" },
  { label: "Trumpet", value: "trumpet" },
  { label: "Clarinet", value: "clarinet" },
  { label: "Cello", value: "cello" },
  { label: "Trombone", value: "trombone" },
  { label: "Harp", value: "harp" },
  { label: "Ukulele", value: "ukulele" },
  { label: "Banjo", value: "banjo" },
  { label: "Accordion", value: "accordion" },
  { label: "Oboe", value: "oboe" },
  { label: "Mandolin", value: "mandolin" },
  { label: "Synthesizer / Keyboard", value: "synth" },
  { label: "Percussion (General)", value: "percussion" },
];



export default function RegisterStudent() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [instrument, setInstrument] = useState('');
  const [location, setLocation] = useState('');

  return (
    <View style={styles.container}>

      {/* Gradient Header */}
      <LinearGradient colors={['#FF9076', '#FF6A5C']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Student Registration</Text>
        <Text style={styles.headerSubtitle}>Create your account to get started</Text>
      </LinearGradient>

      {/* Form Section */}
      <ScrollView contentContainerStyle={styles.formContainer}>

        {/* Full Name */}
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={fullName}
          onChangeText={setFullName}
        />

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
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Confirm Password */}
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* Instrument */}
        {/* <Text style={styles.inputLabel}>Instrument of Interest</Text>
        <TextInput
          style={styles.input}
          placeholder="Select instrument"
          value={instrument}
          onChangeText={setInstrument}
        /> */}


        <Text style={styles.inputLabel}>Instrument</Text>

        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={value => setInstrument(value)}
            items={instruments}
            placeholder={{ label: "Select an instrument", value: null }}
            useNativeAndroidPickerStyle={false}  // <-- required fix
            style={{
              inputIOS: styles.picker,
              inputAndroid: styles.pickerAndroid,
              placeholder: { color: "#888" },
            }}
          />
        </View>


        {/* Location */}
        <Text style={styles.inputLabel}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="City, State"
          value={location}
          onChangeText={setLocation}
        />

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Create Account</Text>
        </TouchableOpacity>

        {/* Footer */}
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.footerLink}>Log in</Text>
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
    fontSize: 22,
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

  picker: {
    backgroundColor: '#F7F7F7',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 15,
    marginBottom: 10,
  },
  

  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
    marginBottom: 10,
  },
  
  pickerAndroid: {
    color: '#333',
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 15,
  },
  

});
