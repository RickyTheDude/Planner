import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
  Image,
  Alert,
  Animated,
  Keyboard,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useRouter, Redirect } from "expo-router";
import { useRoadmapStore } from "../../src/store/useRoadmapStore";
import { useRoadmapStream } from "../../src/hooks/useRoadmapStream";
import { LoadingOverlay } from "../../src/components/LoadingOverlay";
import { BetaModal } from "../../src/components/BetaModal";
import Svg, { Path, Line, Circle, Rect, Polyline } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const MagnetIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 12V4h-3v8a3 3 0 0 1-6 0V4H6v8a6 6 0 0 0 12 0Z" />
    <Path d="M21 8a9 9 0 0 1-18 0" />
    <Path d="M12 19v3" />
    <Path d="M9 21h6" />
  </Svg>
);

const ImmunologyIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const BrainIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-2.5 2.5M9.5 2A4.5 4.5 0 0 0 5 6.5A3.5 3.5 0 0 0 7 13a3.5 3.5 0 0 0-1.5 5A4.5 4.5 0 0 0 9.5 22" />
    <Path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 2.5 2.5M14.5 2A4.5 4.5 0 0 1 19 6.5A3.5 3.5 0 0 1 17 13a3.5 3.5 0 0 1 1.5 5A4.5 4.5 0 0 1 14.5 22" />
    <Path d="M12 8h-2M12 12h-3M12 16h-2" />
    <Path d="M12 8h2M12 12h3M12 16h2" />
  </Svg>
);

const JavaIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <Path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <Line x1="6" y1="2" x2="6" y2="4" />
    <Line x1="10" y1="2" x2="10" y2="4" />
    <Line x1="14" y1="2" x2="14" y2="4" />
  </Svg>
);

const PythonIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="4 17 10 11 4 5" />
    <Line x1="12" y1="19" x2="20" y2="19" />
  </Svg>
);

const ChessIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="3" width="18" height="18" rx="2" />
    <Path d="M3 9h18 M3 15h18 M9 3v18 M15 3v18" />
  </Svg>
);

const ArrowRightIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="5" y1="12" x2="19" y2="12" />
    <Polyline points="12 5 19 12 12 19" />
  </Svg>
);

const InstructionText = ({ isDark }: { isDark: boolean }) => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 5,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateX]);

  return (
    <View className="mt-4 flex-row items-center justify-center">
      <Text className="text-center font-space text-xs text-neoFg/60 dark:text-neoFgDark/60 mr-1.5 flex-shrink">
        Choose a path or swipe right to view ongoing ones
      </Text>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <ArrowRightIcon color={isDark ? "rgba(232, 232, 232, 0.6)" : "rgba(17, 17, 17, 0.6)"} size={14} />
      </Animated.View>
    </View>
  );
};

const SUGGESTED_TOPICS = [
  { title: "EM Waves", subtitle: "Physics", icon: MagnetIcon },
  { title: "Immunology", subtitle: "Biology", icon: ImmunologyIcon },
  { title: "Psychology", subtitle: "Social Science", icon: BrainIcon },
  { title: "Java", subtitle: "Programming", icon: JavaIcon },
  { title: "Python", subtitle: "Programming", icon: PythonIcon },
  { title: "Chess", subtitle: "Strategy", icon: ChessIcon },
];

const ALL_TOPICS = [
  // Physics
  "Electromagnetism", "Kinematics", "Thermodynamics", "Optics", "Electrostatics",
  "Newton's Laws of Motion", "Fluid Mechanics", "Gravitation", "Wave Optics",
  "Quantum Mechanics", "Nuclear Physics", "Classical Mechanics",

  // Mathematics
  "Calculus", "Limits & Continuity", "Derivatives", "Integrals", "Differential Equations",
  "Algebra", "Trigonometry", "Coordinate Geometry", "Probability & Statistics",
  "Matrices & Determinants", "Vectors", "Complex Numbers", "Linear Algebra",

  // Chemistry
  "Organic Chemistry", "Chemical Bonding", "Periodic Table", "Stoichiometry",
  "Chemical Kinetics", "Thermodynamics in Chemistry", "Electrochemistry",
  "Inorganic Chemistry", "Biochemistry", "Acids & Bases", "Atomic Structure",

  // Biology
  "Microbiology", "Genetics", "Cell Biology", "Human Anatomy & Physiology",
  "Plant Physiology", "Evolution & Ecology", "Molecular Biology", "Immunology",
  "Biotechnology", "Photosynthesis", "Circulatory System",

  // Social Sciences
  "Psychology", "Sociology", "Cognitive Science", "Anthropology",
  "Microeconomics", "Macroeconomics", "Behavioral Economics", "Social Psychology",

  // CS & Applied Sciences
  "Computer Science Basics", "Algorithms & Logic", "Data Science", "Astronomy & Astrophysics"
];

export default function HomeScreen() {
  const [prompt, setPrompt] = useState("");
  const [betaModalVisible, setBetaModalVisible] = useState(false);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const [isFocused, setIsFocused] = useState(false);
  const hasSeenOnboarding = useRoadmapStore((s) => s.hasSeenOnboarding);

  // ─── Streaming hook (replaces old generateRoadmap) ───
  const { generateStructure, isStreaming, error: streamError } = useRoadmapStream();
  const isLoading = isStreaming;

  const activeSuggestions = prompt.trim() && isFocused
    ? ALL_TOPICS.filter(t => t.toLowerCase().includes(prompt.toLowerCase().trim()) && t.toLowerCase() !== prompt.toLowerCase().trim()).slice(0, 5)
    : [];

  // Manual keyboard tracking — works reliably on both iOS and Android
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === "ios" ? e.duration : 200,
        useNativeDriver: false,
      }).start();
    });

    const onHide = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: Platform.OS === "ios" ? 250 : 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [keyboardOffset]);

  const handleSelectSuggestion = (topic: string) => {
    setPrompt(topic);
    Keyboard.dismiss();
    setIsFocused(false);
    handleSubmitTopic(topic);
  };

  const handleSubmitTopic = async (topicQuery: string, bypassCheck = false) => {
    const trimmed = topicQuery.trim();
    if (!trimmed || isLoading) return;

    // Check if the topic is one of the SUGGESTED_TOPICS (case-insensitive)
    const isSuggested = SUGGESTED_TOPICS.some(
      (topic) => topic.title.toLowerCase() === trimmed.toLowerCase()
    );

    if (!isSuggested) {
      setBetaModalVisible(true);
      return;
    }

    // Intercept if the course is already present in history
    const roadmaps = useRoadmapStore.getState().roadmaps;
    const existing = roadmaps.find(
      (r) => r.topic.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing && !bypassCheck) {
      Alert.alert(
        "Resume Course?",
        `You have already started "${existing.topic}". Would you like to resume your progress or reset and start over?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Reset Progress",
            style: "destructive",
            onPress: () => {
              useRoadmapStore.getState().deleteRoadmap(existing.id);
              handleSubmitTopic(trimmed, true);
            },
          },
          {
            text: "Resume",
            onPress: () => {
              setPrompt("");
              router.push(`/roadmap/${existing.id}`);
            },
          },
        ]
      );
      return;
    }

    setPrompt(trimmed);
    try {
      const roadmap = await generateStructure(trimmed);
      if (roadmap) {
        setPrompt("");
        router.push(`/roadmap/${roadmap.id}`);
      } else if (streamError) {
        Alert.alert("Generation Failed", streamError);
      }
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
      Alert.alert("Generation Failed", "An error occurred while generating your roadmap. Please check your network connection and try again.");
    }
  };

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  const basePadding = Math.max(insets.bottom, 16) + 12;

  return (
    <View className="flex-1 bg-neoBg dark:bg-neoBgDark">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Remove flex-1 to fix scrolling issues */}
        <View className="px-6 pt-12">
          {/* Logo / Brand Area */}
          <View className="mb-10 items-center">
            <Image
              source={isDark ? require("../../assets/new_icon_inverted.png") : require("../../assets/new_icon.png")}
              className="h-16 w-16 mb-4"
              resizeMode="contain"
            />
            <Text className="text-5xl font-space-bold uppercase tracking-tighter text-neoFg dark:text-neoFgDark">
              PLAN
            </Text>
            <Text className="text-2xl font-space-medium uppercase tracking-tighter text-neoFg dark:text-neoFgDark -mt-1">
              & LEARN
            </Text>
          </View>

          {/* Pre-built Roadmaps Section */}
          <View className="w-full">
            <View className="flex-row flex-wrap justify-between">
              {SUGGESTED_TOPICS.map((topic) => (
                <View key={topic.title} className="w-[48%] mb-4 rounded-xl bg-neoFg dark:bg-neoFgDark">
                  <Pressable
                    onPress={() => handleSubmitTopic(topic.title)}
                    className="h-28 rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark p-3 justify-between -translate-x-1 -translate-y-1 active:translate-x-0 active:translate-y-0"
                  >
                    <View>
                      <topic.icon color={isDark ? "#e8e8e8" : "#111111"} />
                    </View>
                    <View>
                      <Text className="font-space-bold text-neoFg dark:text-neoFgDark text-base leading-tight">{topic.title}</Text>
                      <Text className="text-[10px] font-space-medium text-neoFg/60 dark:text-neoFgDark/60 mt-0.5">@{topic.subtitle}</Text>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Instruction text with animated arrow */}
          <InstructionText isDark={isDark} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Input Bar — animates above keyboard */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: keyboardOffset,
          left: 0,
          right: 0,
          paddingBottom: basePadding,
          paddingTop: activeSuggestions.length > 0 ? 8 : 16,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "#000000ff" : "#ffffffff",
          borderTopWidth: 2,
          borderTopColor: isDark ? "rgba(27, 26, 26, 0.1)" : "rgba(17,17,17,0.1)",
        }}
      >
        {activeSuggestions.length > 0 && (
          <View className="mb-3">
            {activeSuggestions.map((s, index) => (
              <Pressable
                key={s}
                onPress={() => handleSelectSuggestion(s)}
                className={`py-3 px-2 flex-row items-center ${index !== activeSuggestions.length - 1 ? 'border-b border-neoFg/10 dark:border-neoFgDark/10' : ''}`}
              >
                <ArrowRightIcon color={isDark ? "#888888" : "#888888"} size={16} />
                <Text className="ml-3 font-space-medium text-base text-neoFg dark:text-neoFgDark">{s}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View className="bg-neoFg dark:bg-neoFgDark rounded-full">
          <View className="flex-row items-center rounded-full border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark px-3 py-2 -translate-x-1 -translate-y-1">
            <View className="flex-1 relative justify-center">
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                onSubmitEditing={() => handleSubmitTopic(prompt)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsFocused(false), 150);
                }}
                placeholder=""
                returnKeyType="search"
                autoCapitalize="sentences"
                autoCorrect={false}
                editable={!isLoading}
                className="w-full px-4 h-14 text-base font-space-bold text-neoFg dark:text-neoFgDark"
              />
              {!prompt && (
                <View pointerEvents="none" className="absolute left-4 right-4">
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="text-base font-space-bold text-neoFg/50 dark:text-neoFgDark/50"
                  >
                    What do you want to learn?
                  </Text>
                </View>
              )}
            </View>

            {/* Go button */}
            <Pressable
              onPress={() => handleSubmitTopic(prompt)}
              disabled={!prompt.trim() || isLoading}
              className={`h-12 w-12 items-center justify-center rounded-full border-2 border-neoFg dark:border-neoFgDark ${prompt.trim() && !isLoading ? "bg-neoFg dark:bg-neoFgDark" : "bg-neoMain dark:bg-neoMainDark opacity-50"
                }`}
            >
              <ArrowRightIcon color={prompt.trim() && !isLoading ? (isDark ? "#242424" : "#ffffff") : (isDark ? "#e8e8e8" : "#111111")} />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {isLoading && <LoadingOverlay />}
      <BetaModal visible={betaModalVisible} onClose={() => setBetaModalVisible(false)} />
    </View>
  );
}
