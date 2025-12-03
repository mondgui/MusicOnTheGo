import { Stack } from "expo-router";

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="contact-detail" />
      <Stack.Screen name="booking-success" />
    </Stack>
  );
}

