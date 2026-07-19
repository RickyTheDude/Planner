import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { useColorScheme } from 'nativewind';

interface YouTubeBlockProps {
  code: string;
}

export function YouTubeBlock({ code }: YouTubeBlockProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const borderColor = isDark ? '#ffffff' : '#0f172a';
  const bgColor = isDark ? '#1e293b' : '#ffffff';
  const accentBg = isDark ? '#dc2626' : '#ef4444';

  const query = code.trim();
  if (!query) return null;

  const handlePress = () => {
    // Opens in the YouTube app if installed, otherwise in the browser
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    Linking.openURL(searchUrl);
  };

  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <View
          style={{
            marginVertical: 16,
            borderWidth: 3,
            borderColor: borderColor,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: bgColor,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }}
        >
          {/* Red accent bar */}
          <View
            style={{
              backgroundColor: accentBg,
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 16 }}>▶</Text>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: '#ffffff',
              }}
            >
              Watch on YouTube
            </Text>
          </View>

          {/* Search query display */}
          <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_400Regular',
                fontSize: 14,
                color: isDark ? '#e2e8f0' : '#334155',
                lineHeight: 20,
              }}
              numberOfLines={2}
            >
              {query}
            </Text>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_400Regular',
                fontSize: 11,
                color: isDark ? '#94a3b8' : '#64748b',
                marginTop: 4,
              }}
            >
              Tap to search on YouTube →
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
