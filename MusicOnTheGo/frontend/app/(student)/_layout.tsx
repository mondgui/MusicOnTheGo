import { Stack } from "expo-router";

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="book-lesson" />
      <Stack.Screen name="my-lessons" />
    </Stack>
  );
}
