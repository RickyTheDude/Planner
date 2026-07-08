import React, { useEffect, useRef } from "react";
import { View, Animated, Text } from "react-native";
import { useColorScheme } from "nativewind";
import Svg, { Path } from "react-native-svg";

interface LoadingOverlayProps {
  message?: string;
}

const LoadingIcon = ({ color }: { color: string }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </Svg>
    </Animated.View>
  );
};

export function LoadingOverlay({
  message = "Generating your roadmap...",
}: LoadingOverlayProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-black/60 px-6">
      {/* Shadow wrapper */}
      <View className="bg-neoFg dark:bg-neoFgDark rounded-2xl w-full max-w-[280px]">
        {/* Main card */}
        <View className="items-center rounded-2xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark p-8 -translate-x-1.5 -translate-y-1.5">
          <LoadingIcon color={isDark ? "#e8e8e8" : "#111111"} />
          <Text className="mt-5 text-center text-sm font-space-bold uppercase text-neoFg dark:text-neoFgDark">
            {message}
          </Text>
          <Text className="mt-1.5 text-center font-mono text-[10px] text-neoFg/60 dark:text-neoFgDark/60 uppercase">
            Please stand by
          </Text>
        </View>
      </View>
    </View>
  );
}
