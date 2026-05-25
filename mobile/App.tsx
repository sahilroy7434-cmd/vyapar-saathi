import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import './src/i18n';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { palette } from './src/theme/colors';

export default function App() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, primary: palette.primary, background: palette.darkBg } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: palette.primary, background: palette.lightBg } };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
