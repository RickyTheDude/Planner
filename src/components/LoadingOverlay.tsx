import React from "react";
import { View, ActivityIndicator, Text, useColorScheme } from "react-native";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({
  message = "Generating your roadmap...",
}: LoadingOverlayProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-black/60 px-6">
      {/* Shadow wrapper */}
      <View className="bg-neoFg rounded-2xl w-full max-w-[280px]">
        {/* Sticky note card */}
        <View
          style={{ transform: [{ rotate: "1.5deg" }] }}
          className="items-center rounded-2xl border-3 border-neoFg bg-[#fef08a] p-8 -translate-x-1.5 -translate-y-1.5"
        >
          {/* Tape decoration */}
          <View
            className="absolute -top-3 left-1/2 w-16 h-6 bg-white/70 border border-black/15 shadow-sm"
            style={{
              transform: [{ translateX: -32 }, { rotate: "-2deg" }],
            }}
          />

          <ActivityIndicator size="large" color="#111111" />
          <Text className="mt-5 text-center text-sm font-space-bold uppercase text-neoFg">
            {message}
          </Text>
          <Text className="mt-1.5 text-center font-mono text-[10px] text-neoFg/60 uppercase">
            Please stand by
          </Text>
        </View>
      </View>
    </View>
  );
}
