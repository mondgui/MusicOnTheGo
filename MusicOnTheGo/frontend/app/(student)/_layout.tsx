import { Stack } from "expo-router";

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard/index" />
      <Stack.Screen name="my-bookings" />
      <Stack.Screen name="book-lesson" />
      <Stack.Screen name="student-profile-setup" />
      <Stack.Screen name="practice-log" />
      <Stack.Screen name="resources" />
      <Stack.Screen name="practice-tools" />
      <Stack.Screen name="teacher" />
    </Stack>
  );
}
