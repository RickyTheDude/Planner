import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoadmapStore } from "../src/store/useRoadmapStore";
import Svg, { Path, Circle, Line, Polyline } from "react-native-svg";
import Animated, { FadeInDown, FadeIn, FadeOut, SlideInRight, SlideOutLeft, Layout, useSharedValue, useAnimatedStyle, withTiming, Easing, useAnimatedReaction, runOnJS } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const triggerStarHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

const triggerHeavyHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

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

const TypewriterText = ({ text, className, typingSpeed = 80, delay = 0 }: { text: string, className?: string, typingSpeed?: number, delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        i++;
        if (i >= text.length) {
          clearInterval(intervalId);
          setIsTyping(false);
        }
      }, typingSpeed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, typingSpeed, delay]);

  useEffect(() => {
    if (isTyping) {
      setShowCursor(true);
      return;
    }
    const cursorInterval = setInterval(() => {
      setShowCursor(s => !s);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, [isTyping]);

  return (
    <Text className={className}>
      {displayedText}
      <Text style={{ fontWeight: '100' }}>{showCursor ? '|' : ' '}</Text>
    </Text>
  );
};

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

  const rotation = useSharedValue(1080); // 3 full rotations
  const lastHapticAngle = useSharedValue(1080);

  useEffect(() => {
    rotation.value = withTiming(0, {
      duration: 2500,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
      if (finished) {
        runOnJS(triggerHeavyHaptic)();
      }
    });
  }, []);

  useAnimatedReaction(
    () => rotation.value,
    (currentValue) => {
      // Trigger a haptic tap every 45 degrees of rotation
      if (lastHapticAngle.value - currentValue >= 45) {
        lastHapticAngle.value = currentValue;
        runOnJS(triggerStarHaptic)();
      }
    }
  );

  const imageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 2) {
      setStep(step + 1);
    } else {
      setHasSeenOnboarding(true);
      router.replace("/");
    }
  };

  const handleSelectProfile = (id: typeof PROFILES[number]["id"]) => {
    Haptics.selectionAsync();
    setAudience(id);
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Animated.View 
            key="step0"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(300)}
            className="flex-1 justify-center items-center px-6"
          >
            <Animated.View entering={FadeIn.duration(600)}>
              <Animated.Image
                style={imageStyle}
                source={isDark ? require("../assets/new_icon_inverted.png") : require("../assets/new_icon.png")}
                className="h-28 w-28 mb-10"
                resizeMode="contain"
              />
            </Animated.View>
            <Animated.Text 
              entering={FadeInDown.delay(200).duration(500).springify()}
              className="text-5xl font-space-bold  text-center text-neoFg dark:text-neoFgDark mb-4 leading-tight"
            >
              Plan & Learn
            </Animated.Text>
            <Animated.Text 
              entering={FadeInDown.delay(400).duration(500).springify()}
              className="text-lg font-space-medium text-center text-neoFg/70 dark:text-neoFgDark/70 mb-12"
            >
              Generate AI-powered curriculum maps to master complex topics step-by-step.
            </Animated.Text>
          </Animated.View>
        );
      case 1:
        return (
          <Animated.View 
            key="step1"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(300)}
            className="flex-1 justify-center px-6"
          >
            <Animated.View entering={FadeInDown.duration(400).springify()} className="items-center mb-8">
              {/* <View className="h-16 w-16 rounded-2xl border-4 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark items-center justify-center -translate-x-1 -translate-y-1 mb-6">
                <UserIcon color={isDark ? "#111111" : "#111111"} />
              </View> */}
              <Text className="text-4xl font-space-bold  text-center text-neoFg dark:text-neoFgDark mb-3">
                Who are you?
              </Text>
              <Text className="text-base font-space-medium text-center text-neoFg/70 dark:text-neoFgDark/70 mb-8">
                We tailor your learning paths based on your profile.
              </Text>
            </Animated.View>

            <View className="gap-4">
              {PROFILES.map((profile, index) => {
                const isSelected = currentAudience === profile.id;
                return (
                  <Animated.View 
                    key={profile.id}
                    entering={FadeInDown.delay(100 + index * 100).duration(400).springify()}
                    layout={Layout.springify()}
                  >
                    <Pressable
                      onPress={() => handleSelectProfile(profile.id)}
                      className={`rounded-xl border-4 border-neoFg dark:border-neoFgDark p-4 justify-center ${isSelected ? 'bg-neoFg dark:bg-neoFgDark translate-x-0 translate-y-0' : 'bg-neoMain dark:bg-neoMainDark -translate-x-1 -translate-y-1 active:translate-x-0 active:translate-y-0'}`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className={`font-space-bold text-lg ${isSelected ? 'text-neoBg dark:text-neoBgDark' : 'text-neoFg dark:text-neoFgDark'}`}>
                            {profile.title}
                          </Text>
                          <Text className={`font-space-medium text-sm mt-1 ${isSelected ? 'text-neoBg/80 dark:text-neoBgDark/80' : 'text-neoFg/70 dark:text-neoFgDark/70'}`}>
                            {profile.desc}
                          </Text>
                        </View>
                        {isSelected && (
                          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} className="ml-4">
                            <CheckIcon color={isDark ? "#ffffff" : "#000000"} />
                          </Animated.View>
                        )}
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View 
            key="step2"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(300)}
            className="flex-1 justify-center items-center px-6"
          >
            <TypewriterText 
              text="You're all set!"
              delay={100}
              typingSpeed={60}
              className="text-5xl font-space-bold  text-center text-neoFg dark:text-neoFgDark mb-6 leading-tight"
            />
            <Animated.Text 
              entering={FadeInDown.delay(1200).duration(500).springify()}
              className="text-xl font-space-medium text-center text-neoFg/70 dark:text-neoFgDark/70 mb-12"
            >
              Get ready to dive deep into topics precisely tuned for your level.
            </Animated.Text>
          </Animated.View>
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
        <Animated.View entering={FadeIn.delay(300).duration(500)} className="flex-row justify-between items-center px-6 py-4">
          <View className="flex-row gap-2">
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                layout={Layout.springify()}
                className={`h-2 rounded-full ${i === step ? "w-8 bg-neoFg dark:bg-neoFgDark" : "w-2 bg-neoFg/20 dark:bg-neoFgDark/20"}`}
              />
            ))}
          </View>
        </Animated.View>

        {renderStepContent()}

        <Animated.View 
          key={`btn-${step}`}
          entering={FadeInDown.delay(step === 2 ? 1500 : 300).duration(500).springify()} 
          className="px-6 mt-auto pt-8"
        >
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
        </Animated.View>
      </ScrollView>
    </View>
  );
}
