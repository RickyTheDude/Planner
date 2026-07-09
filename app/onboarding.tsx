import React, { useState } from "react";
import { View, Text, Pressable, Image, ScrollView, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoadmapStore } from "../src/store/useRoadmapStore";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";

const ArrowRightIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="5" y1="12" x2="19" y2="12" />
    <Polyline points="12 5 19 12 12 19" />
  </Svg>
);

const UserIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

const PROFILES = [
  { id: "school_student", title: "School Student", desc: "Focuses on simple analogies & basics." },
  { id: "university_student", title: "University Student", desc: "Technical depth & practical examples." },
  { id: "working_professional", title: "Working Professional", desc: "System architecture & real-world scaling." },
] as const;

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const setHasSeenOnboarding = useRoadmapStore((s) => s.setHasSeenOnboarding);
  const setAudience = useRoadmapStore((s) => s.setAudience);
  const currentAudience = useRoadmapStore((s) => s.audience);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setHasSeenOnboarding(true);
      router.replace("/");
    }
  };

  const handleSelectProfile = (id: typeof PROFILES[number]["id"]) => {
    setAudience(id);
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <View className="flex-1 justify-center items-center px-6">
            <Image
              source={isDark ? require("../assets/new_icon_inverted.png") : require("../assets/new_icon.png")}
              className="h-24 w-24 mb-8"
              resizeMode="contain"
            />
            <Text className="text-4xl font-space-bold uppercase text-center text-neoFg dark:text-neoFgDark mb-4 leading-tight">
              Welcome to PLAN & LEARN
            </Text>
            <Text className="text-lg font-space-medium text-center text-neoFg/70 dark:text-neoFgDark/70 mb-12">
              Generate AI-powered curriculum maps to master complex topics step-by-step.
            </Text>
          </View>
        );
      case 1:
        return (
          <View className="flex-1 justify-center px-6">
            <View className="items-center mb-8">
              <View className="h-16 w-16 rounded-2xl border-4 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark items-center justify-center -translate-x-1 -translate-y-1 mb-6">
                <UserIcon color={isDark ? "#111111" : "#111111"} />
              </View>
              <Text className="text-3xl font-space-bold uppercase text-center text-neoFg dark:text-neoFgDark mb-3">
                Who are you?
              </Text>
              <Text className="text-base font-space-medium text-center text-neoFg/70 dark:text-neoFgDark/70 mb-8">
                We tailor your learning paths based on your profile.
              </Text>
            </View>

            <View className="gap-4">
              {PROFILES.map((profile) => (
                <Pressable
                  key={profile.id}
                  onPress={() => handleSelectProfile(profile.id)}
                  className={`rounded-xl border-4 border-neoFg dark:border-neoFgDark ${currentAudience === profile.id ? 'bg-neoFg dark:bg-neoFgDark translate-x-0 translate-y-0' : 'bg-neoMain dark:bg-neoMainDark -translate-x-1 -translate-y-1 active:translate-x-0 active:translate-y-0'} p-4 justify-center`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className={`font-space-bold text-lg ${currentAudience === profile.id ? 'text-neoBg dark:text-neoBgDark' : 'text-neoFg dark:text-neoFgDark'}`}>
                        {profile.title}
                      </Text>
                      <Text className={`font-space-medium text-sm mt-1 ${currentAudience === profile.id ? 'text-neoBg/80 dark:text-neoBgDark/80' : 'text-neoFg/70 dark:text-neoFgDark/70'}`}>
                        {profile.desc}
                      </Text>
                    </View>
                    {currentAudience === profile.id && (
                      <View className="ml-4">
                        <CheckIcon color={isDark ? "#ffffff" : "#000000"} />
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-5xl font-space-bold uppercase text-center text-neoFg dark:text-neoFgDark mb-6 leading-tight">
              You're all set!
            </Text>
            <Text className="text-xl font-space-medium text-center text-neoFg/70 dark:text-neoFgDark/70 mb-12">
              Get ready to dive deep into topics precisely tuned for your level.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-neoBg dark:bg-neoBgDark">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 24) }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center px-6 py-4">
          <View className="flex-row gap-2">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className={`h-2 rounded-full ${i === step ? "w-8 bg-neoFg dark:bg-neoFgDark" : "w-2 bg-neoFg/20 dark:bg-neoFgDark/20"}`}
              />
            ))}
          </View>
        </View>

        {renderStepContent()}

        <View className="px-6 mt-auto pt-8">
          <View className="bg-neoFg dark:bg-neoFgDark rounded-2xl">
            <Pressable
              onPress={step === 1 && !currentAudience ? undefined : handleNext}
              className={`flex-row items-center justify-center rounded-2xl border-4 border-neoFg dark:border-neoFgDark py-4 ${step === 1 && !currentAudience ? 'bg-neoMain dark:bg-neoMainDark opacity-50 translate-x-0 translate-y-0' : 'bg-neoMain dark:bg-neoMainDark -translate-x-1.5 -translate-y-1.5 active:translate-x-0 active:translate-y-0'}`}
            >
              <Text className="text-xl font-space-bold uppercase text-neoFg dark:text-neoFgDark mr-2">
                {step === 2 ? "Start Learning" : "Next"}
              </Text>
              <ArrowRightIcon color={isDark ? "#e8e8e8" : "#111111"} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
