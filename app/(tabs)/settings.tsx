import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useRoadmapStore } from "../../src/store/useRoadmapStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle, Line } from "react-native-svg";

const SunIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="5" />
    <Line x1="12" y1="1" x2="12" y2="3" />
    <Line x1="12" y1="21" x2="12" y2="23" />
    <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <Line x1="1" y1="12" x2="3" y2="12" />
    <Line x1="21" y1="12" x2="23" y2="12" />
    <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </Svg>
);

const MoonIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Svg>
);

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useRoadmapStore((s) => s.theme ?? "light");
  const setTheme = useRoadmapStore((s) => s.setTheme);
  const detailLevel = useRoadmapStore((s) => s.detailLevel);
  const setDetailLevel = useRoadmapStore((s) => s.setDetailLevel);
  const insets = useSafeAreaInsets();

  const fgColor = isDark ? "#ffffff" : "#0f172a";

  const renderThemeSegment = () => {
    const options: { label: string; value: "light" | "dark" }[] = [
      { label: "Light", value: "light" },
      { label: "Dark", value: "dark" }
    ];

    return (
      <View className="mb-8">
        <Text className="text-sm font-space-bold uppercase tracking-wider text-neoFg/50 dark:text-neoFgDark/50 mb-4">
          Appearance
        </Text>
        <View className="rounded-xl bg-neoFg dark:bg-neoFgDark">
          <View className="flex-row items-center justify-between rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark p-1 -translate-x-1 -translate-y-1">
            {options.map((opt) => {
              const isSelected = theme === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    setTheme(opt.value);
                    setColorScheme(opt.value);
                  }}
                  className={`flex-1 items-center justify-center py-3 rounded-lg mx-0.5 border-2 ${
                    isSelected ? 'bg-neoYellow dark:bg-neoYellowDark border-neoFg dark:border-neoFgDark' : 'border-transparent'
                  }`}
                >
                  <Text className={`text-sm font-space-bold uppercase ${
                    isSelected ? 'text-neoFg dark:text-neoFgDark' : 'text-neoFg/60 dark:text-neoFgDark/60'
                  }`}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderDetailBlock = () => {
    const options: { label: string; value: "quick" | "standard" | "comprehensive"; caption: string }[] = [
      { label: "Quick", value: "quick", caption: "~5 modules for a fast summary" },
      { label: "Standard", value: "standard", caption: "~10 modules (Default)" },
      { label: "Comprehensive", value: "comprehensive", caption: "Up to 20 modules for a deep-dive" }
    ];

    return (
      <View className="flex-1 mb-8">
        <Text className="text-sm font-space-bold uppercase tracking-wider text-neoFg/50 dark:text-neoFgDark/50 mb-4">
          Roadmap Detail Level
        </Text>
        <View className="flex-1 rounded-xl bg-neoFg dark:bg-neoFgDark">
          <View className="flex-1 rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoBg dark:bg-neoBgDark p-6 -translate-x-1 -translate-y-1 justify-center">
            {options.map((opt, idx) => {
              const isSelected = detailLevel === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setDetailLevel(opt.value)}
                  className={`py-6 ${idx < options.length - 1 ? 'mb-6' : ''}`}
                >
                  <Text className={`text-4xl font-space-bold uppercase tracking-tighter ${
                    isSelected ? 'text-neoFg dark:text-neoFgDark' : 'text-neoFg/30 dark:text-neoFgDark/30'
                  }`}>
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <Text className="text-sm font-mono text-neoFg/70 dark:text-neoFgDark/70 mt-2">
                      {opt.caption}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  // TODO: Purge this block when satisfied with onboarding
  const renderDebugBlock = () => {
    return (
      <View className="mb-8">
        <Text className="text-sm font-space-bold uppercase tracking-wider text-red-500 mb-4">
          Debug Options
        </Text>
        <Pressable
          onPress={() => {
            useRoadmapStore.getState().setHasSeenOnboarding(false);
            require('expo-router').router.replace("/onboarding");
          }}
          className="rounded-xl border-2 border-red-500 bg-red-500/10 p-4"
        >
          <Text className="text-red-500 font-space-bold text-center">Reset & Test Onboarding</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-neoBg dark:bg-neoBgDark">
      <View className="pt-3 px-5 pb-5 flex-row items-center">
        <Text className="text-xl font-space-bold tracking-tight text-neoFg dark:text-neoFgDark">
          Settings
        </Text>
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        {renderThemeSegment()}
        {renderDetailBlock()}
        {__DEV__ && renderDebugBlock()}
      </View>
    </View>
  );
}
