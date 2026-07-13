import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useColorScheme } from 'nativewind';

/**
 * Animated skeleton loader that mimics the structure of module content.
 * Shows pulsing placeholder bars for title, body text, and code blocks.
 */
export function ModuleLoadingSkeleton() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  const barColor = isDark ? '#334155' : '#e2e8f0';
  const accentColor = isDark ? '#475569' : '#cbd5e1';

  const Bar = ({ width, height = 14, marginBottom = 10 }: { width: string | number; height?: number; marginBottom?: number }) => (
    <Animated.View
      style={{
        width: width as any,
        height,
        borderRadius: 6,
        backgroundColor: barColor,
        marginBottom,
        opacity: pulse,
      }}
    />
  );

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
      {/* Title skeleton */}
      <Bar width="75%" height={26} marginBottom={20} />

      {/* Description line */}
      <Bar width="90%" height={12} />
      <Bar width="100%" height={12} />
      <Bar width="65%" height={12} marginBottom={24} />

      {/* Subheading */}
      <Bar width="50%" height={20} marginBottom={16} />

      {/* Paragraph */}
      <Bar width="100%" height={12} />
      <Bar width="95%" height={12} />
      <Bar width="88%" height={12} />
      <Bar width="100%" height={12} />
      <Bar width="70%" height={12} marginBottom={24} />

      {/* Code block skeleton */}
      <Animated.View
        style={{
          width: '100%',
          height: 120,
          borderRadius: 12,
          borderWidth: 3,
          borderColor: isDark ? '#475569' : '#cbd5e1',
          backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
          marginBottom: 24,
          padding: 16,
          opacity: pulse,
        }}
      >
        <View style={{ width: '80%', height: 10, borderRadius: 4, backgroundColor: accentColor, marginBottom: 8 }} />
        <View style={{ width: '60%', height: 10, borderRadius: 4, backgroundColor: accentColor, marginBottom: 8 }} />
        <View style={{ width: '90%', height: 10, borderRadius: 4, backgroundColor: accentColor, marginBottom: 8 }} />
        <View style={{ width: '45%', height: 10, borderRadius: 4, backgroundColor: accentColor }} />
      </Animated.View>

      {/* More paragraph lines */}
      <Bar width="55%" height={20} marginBottom={16} />
      <Bar width="100%" height={12} />
      <Bar width="92%" height={12} />
      <Bar width="78%" height={12} />
      <Bar width="100%" height={12} />
      <Bar width="85%" height={12} marginBottom={24} />

      {/* Diagram placeholder */}
      <Animated.View
        style={{
          width: '100%',
          height: 160,
          borderRadius: 12,
          borderWidth: 3,
          borderColor: isDark ? '#475569' : '#cbd5e1',
          backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
          marginBottom: 24,
          opacity: pulse,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: accentColor }} />
      </Animated.View>
    </View>
  );
}
