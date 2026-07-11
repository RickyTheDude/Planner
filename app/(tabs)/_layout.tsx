import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const fgColor = isDark ? '#e8e8e8' : '#111111';
  const inactiveColor = isDark ? 'rgba(232, 232, 232, 0.4)' : 'rgba(17, 17, 17, 0.4)';
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopWidth: 0,
          height: 72 + insets.bottom,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontFamily: 'SpaceGrotesk_700Bold',
          fontSize: 14,
          textTransform: 'uppercase',
          marginBottom: 10,
        },
        tabBarActiveTintColor: fgColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarIconStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="history"
        options={{
          title: "Lessons",
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}
