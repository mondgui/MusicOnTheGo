import { Stack } from "expo-router";

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard/index" />
      <Stack.Screen name="my-bookings" />
      <Stack.Screen name="book-lesson" />
      <Stack.Screen name="student-profile-setup" />
      <Stack.Screen name="practice-log" />
      <Stack.Screen name="practice-timer" />
      <Stack.Screen name="resources" />
      <Stack.Screen name="practice-tools" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="help-center" />
      <Stack.Screen name="contact-support" />
      <Stack.Screen name="about" />
      <Stack.Screen name="teacher" />
    </Stack>
  );
}
