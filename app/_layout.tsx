import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator, Image } from 'react-native';
import { initDatabase } from '../services/db';
import "../global.css";

export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        // Critical: Initialize DB before anything else
        await initDatabase();
        
        const onboardingComplete = await SecureStore.getItemAsync('onboarding_complete');
        
        // Short delay to show splash if needed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsReady(true);
        await SplashScreen.hideAsync();

        const inAuthGroup = segments[0] === '(tabs)';
        
        if (!onboardingComplete) {
          router.replace('/onboarding');
        } else if (onboardingComplete && !inAuthGroup) {
          // You could add session check here
          // router.replace('/auth');
        }
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, [isReady]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <Image 
          source={{ uri: 'file:///C:/Users/rajsi/.gemini/antigravity/brain/ea107179-bfcd-470f-aa9c-e5ff615306fe/spitishield_logo_1778226434132.png' }}
          style={{ width: 120, height: 120, borderRadius: 24 }}
        />
        <ActivityIndicator size="small" color="#FF5722" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="triage" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
