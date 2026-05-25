import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Text, ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import PracticeScreen from '../screens/PracticeScreen';
import MockTestListScreen from '../screens/MockTestListScreen';
import MockRunnerScreen from '../screens/MockRunnerScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DailyScreen from '../screens/DailyScreen';
import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function tabIcon(label: string) {
  return ({ color }: { color: string }) => (
    <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{label}</Text>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: t('tabs.home'), tabBarIcon: tabIcon('🏠') }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{ tabBarLabel: t('tabs.practice'), tabBarIcon: tabIcon('📝') }}
      />
      <Tab.Screen
        name="Mocks"
        component={MockTestListScreen}
        options={{ tabBarLabel: t('tabs.mocks'), tabBarIcon: tabIcon('⏱️') }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarLabel: t('tabs.analytics'), tabBarIcon: tabIcon('📊') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t('tabs.profile'), tabBarIcon: tabIcon('👤') }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuthStore();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="MockRunner"
            component={MockRunnerScreen}
            options={{ headerShown: true, title: 'Mock Test' }}
          />
          <Stack.Screen
            name="Daily"
            component={DailyScreen}
            options={{ headerShown: true, title: 'Daily' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
