import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "nativewind";
import { LogoLoader } from "./LogoLoader";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({
  message = "Generating your roadmap...",
}: LoadingOverlayProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-neoFg/80 dark:bg-neoFgDark/80 px-6">
      {/* Shadow wrapper */}
      <View className="bg-neoFg dark:bg-neoFgDark rounded-2xl w-full max-w-[300px]">
        {/* Main card */}
        <View className="items-center rounded-2xl border-4 border-neoFg dark:border-neoFgDark bg-neoCyan dark:bg-neoCyanDark p-8 -translate-x-2 -translate-y-2">
          
          {/* Logo Box */}
          <View className="bg-neoMain dark:bg-neoMainDark p-5 rounded-xl border-3 border-neoFg dark:border-neoFgDark mb-6 w-24 h-24 items-center justify-center shadow-neo-sm dark:shadow-neoDark-sm">
            <LogoLoader size={50} isDark={isDark} />
          </View>
          
          <Text className="text-center text-base font-space-bold uppercase text-neoFg dark:text-neoFgDark leading-tight tracking-wider">
            {message}
          </Text>
          
          {/* Status Badge */}
          <View className="mt-5 bg-neoFg dark:bg-neoFgDark px-4 py-1.5 rounded border-2 border-neoFg dark:border-neoFgDark">
            <Text className="text-center font-space-bold text-[10px] text-neoMain dark:text-neoMainDark uppercase tracking-[0.2em]">
              Please stand by
            </Text>
          </View>
          
        </View>
      </View>
    </View>
  );
}
