import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useRoadmapStore } from "../../src/store/useRoadmapStore";
import { generateRoadmap } from "../../src/services/mockAI";
import { LoadingOverlay } from "../../src/components/LoadingOverlay";
import Svg, { Path, Line, Circle, Rect, Polyline } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MicIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <Line x1="12" x2="12" y1="19" y2="22" />
  </Svg>
);

const GlobeIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <Path d="M2 12h20" />
  </Svg>
);

const ServerIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <Rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <Line x1="6" x2="6.01" y1="6" y2="6" />
    <Line x1="6" x2="6.01" y1="18" y2="18" />
  </Svg>
);

const ChartIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 3v18h18" />
    <Path d="m19 9-5 5-4-4-3 3" />
  </Svg>
);

const PhoneIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <Line x1="12" x2="12.01" y1="18" y2="18" />
  </Svg>
);

const ArrowRightIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="5" y1="12" x2="19" y2="12" />
    <Polyline points="12 5 19 12 12 19" />
  </Svg>
);

const SUGGESTED_TOPICS = [
  { title: "React", subtitle: "Frontend", icon: GlobeIcon },
  { title: "Node.js", subtitle: "Backend", icon: ServerIcon },
  { title: "Python", subtitle: "Machine Learning", icon: ChartIcon },
  { title: "Mobile", subtitle: "React Native", icon: PhoneIcon },
  { title: "System", subtitle: "Architecture", icon: ServerIcon },
  { title: "UI/UX", subtitle: "Design Basics", icon: GlobeIcon },
];

export default function HomeScreen() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const addRoadmap = useRoadmapStore((s) => s.addRoadmap);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const handleSubmitTopic = async (topicQuery: string) => {
    const trimmed = topicQuery.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setPrompt(trimmed); // Update input field to show what's being generated
    try {
      const roadmap = await generateRoadmap(trimmed);
      addRoadmap(roadmap);
      setPrompt("");
      router.push(`/roadmap/${roadmap.id}`);
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-neoBg dark:bg-neoBgDark"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Remove flex-1 to fix scrolling issues */}
        <View className="px-6 pt-12">
          {/* Logo / Brand Area */}
          <View className="mb-10 items-center">
            {/* Neobrutalist logo block */}
            <View className="mb-4 bg-neoFg dark:bg-neoFgDark rounded-2xl">
              <View className="h-16 w-16 items-center justify-center rounded-2xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark -translate-x-1 -translate-y-1 overflow-hidden">
                <Image
                  source={require("../../assets/new_icon.png")}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </View>
            <Text className="text-3xl font-space-bold uppercase tracking-tight text-neoFg dark:text-neoFgDark">
              Cognimosity
            </Text>
            <Text className="mt-2 text-center font-mono text-[10px] leading-relaxed text-neoFg/75 dark:text-neoFgDark/75 uppercase">
              Choose a path or search any topic
            </Text>
          </View>

          {/* Pre-built Roadmaps Section */}
          <View className="w-full">
            <Text className="text-xs font-space-bold uppercase tracking-wider text-neoFg dark:text-neoFgDark mb-4">
              Suggested Paths
            </Text>
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
        </View>
      </ScrollView>

      {/* Fixed Bottom Input Bar */}
      <View 
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}
        className="absolute bottom-0 left-0 right-0 px-4 pt-4 bg-neoBg dark:bg-neoBgDark border-t-2 border-neoFg/10 dark:border-neoFgDark/10"
      >
        <View className="bg-neoFg dark:bg-neoFgDark rounded-full">
          <View className="flex-row items-center rounded-full border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark px-3 py-2 -translate-x-1 -translate-y-1">
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              onSubmitEditing={() => handleSubmitTopic(prompt)}
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
      </View>

      {isLoading && <LoadingOverlay />}
    </KeyboardAvoidingView>
  );
}
