import { Fraunces_400Regular, Fraunces_400Regular_Italic, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider } from '@/i18n/I18nProvider';
import { LibraryProvider } from '@/store/LibraryProvider';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  const [loaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <SafeAreaProvider style={{ backgroundColor: colors.bg }}>
      <I18nProvider>
        <LibraryProvider>
          <StatusBar style="light" />
          {/* On web (desktop demo) keep the app at phone width, centred. */}
          <View style={Platform.OS === 'web' ? webFrame : { flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: 'fade_from_bottom',
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="book/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="add" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="premium" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="wrapped" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
            </Stack>
          </View>
        </LibraryProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const webFrame = {
  flex: 1,
  width: '100%' as const,
  maxWidth: 480,
  alignSelf: 'center' as const,
  overflow: 'hidden' as const,
  borderLeftWidth: 1,
  borderRightWidth: 1,
  borderColor: colors.border,
};
