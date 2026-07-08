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
import { useRouter } from "expo-router";
import { useRoadmapStore } from "../../src/store/useRoadmapStore";
import { useRoadmapStream } from "../../src/hooks/useRoadmapStream";
import { LoadingOverlay } from "../../src/components/LoadingOverlay";
import { BetaModal } from "../../src/components/BetaModal";
import Svg, { Path, Line, Circle, Rect, Polyline } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MicIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <Line x1="12" x2="12" y1="19" y2="22" />
  </Svg>
);

const MagnetIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 12V4h-3v8a3 3 0 0 1-6 0V4H6v8a6 6 0 0 0 12 0Z" />
    <Path d="M21 8a9 9 0 0 1-18 0" />
    <Path d="M12 19v3" />
    <Path d="M9 21h6" />
  </Svg>
);

const CalculusIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14.5 5c0-2-3-2-3 0v14c0 2 3 2 3 0" />
    <Path d="M3 12h18" />
    <Path d="M12 3v18" />
    <Path d="M6 16c3-1 4-7 8-7s3 3 5 3" />
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

const MicroscopeIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 18h8" />
    <Path d="M3 22h18" />
    <Path d="M14 22a7 7 0 1 0-14 0" />
    <Path d="M9 14h2" />
    <Path d="M9 12a3 3 0 0 1-3-3V6h6v3a3 3 0 0 1-3 3Z" />
    <Path d="M12 6h4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <Path d="M12 2h2" />
  </Svg>
);

const SociologyIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="6" r="3" />
    <Circle cx="6" cy="18" r="3" />
    <Circle cx="18" cy="18" r="3" />
    <Line x1="12" y1="9" x2="6" y2="15" />
    <Line x1="12" y1="9" x2="18" y2="15" />
    <Line x1="9" y1="18" x2="15" y2="18" />
    <Circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
  </Svg>
);

const KinematicsIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="2" y1="21" x2="22" y2="21" />
    <Path d="M4 21c2-10 10-16 14-8" strokeDasharray="3 3" />
    <Line x1="4" y1="21" x2="8" y2="13" />
    <Polyline points="5 13 8 13 8 16" />
    <Circle cx="18" cy="13" r="2.5" fill={color} />
    <Path d="M14 11l2 1" />
    <Path d="M15 9l1 2" />
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
  { title: "Electricity", subtitle: "Physics", icon: MagnetIcon },
  { title: "Calculus", subtitle: "Mathematics", icon: CalculusIcon },
  { title: "Psychology", subtitle: "Social Science", icon: BrainIcon },
  { title: "Microbiology", subtitle: "Biology", icon: MicroscopeIcon },
  { title: "Sociology", subtitle: "Human Behavior", icon: SociologyIcon },
  { title: "Kinematics", subtitle: "Mechanics", icon: KinematicsIcon },
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

  const handleSubmitTopic = async (topicQuery: string) => {
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
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              onSubmitEditing={() => handleSubmitTopic(prompt)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsFocused(false), 150);
              }}
              placeholder="What do you want to learn?"
              placeholderTextColor={isDark ? "#888888" : "#666666"}
              returnKeyType="search"
              autoCapitalize="sentences"
              autoCorrect={false}
              editable={!isLoading}
              className="flex-1 px-4 h-14 text-base font-space-bold text-neoFg dark:text-neoFgDark"
            />
            {/* Mic button (stub) */}
            <Pressable className="p-3 mr-2">
              <MicIcon color={isDark ? "#e8e8e8" : "#111111"} />
            </Pressable>
            {/* Go button */}
            <Pressable
              onPress={() => handleSubmitTopic(prompt)}
              disabled={!prompt.trim() || isLoading}
              className={`h-12 w-12 items-center justify-center rounded-full border-2 border-neoFg dark:border-neoFgDark ${
                prompt.trim() && !isLoading ? "bg-neoFg dark:bg-neoFgDark" : "bg-neoMain dark:bg-neoMainDark opacity-50"
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
