import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register-student" />
      <Stack.Screen name="register-teacher" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}

