import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import 'react-native-reanimated';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>

        {/* Public screens */}
        <Stack.Screen name="index" />
        <Stack.Screen name="choose-role" />
        <Stack.Screen name="register-student" />
        <Stack.Screen name="register-teacher" />
        <Stack.Screen name="login" />
        <Stack.Screen name="success" />
        <Stack.Screen name="profile-setup" />

        

      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
