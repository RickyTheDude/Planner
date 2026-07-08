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
  { title: "React", subtitle: "Frontend", icon: GlobeIcon },
  { title: "Node.js", subtitle: "Backend", icon: ServerIcon },
  { title: "Python", subtitle: "Machine Learning", icon: ChartIcon },
  { title: "Mobile", subtitle: "React Native", icon: PhoneIcon },
  { title: "System", subtitle: "Architecture", icon: ServerIcon },
  { title: "UI/UX", subtitle: "Design Basics", icon: GlobeIcon },
];

const ALL_TOPICS = [
  // Web & Frontend
  "React", "React Native", "Next.js", "Vue.js", "Angular", "Svelte", 
  "HTML & CSS", "JavaScript", "TypeScript", "Tailwind CSS", "Bootstrap",
  "Redux", "Webpack", "Vite", "Framer Motion", "Three.js", "WebAssembly",
  
  // Backend & APIs
  "Node.js", "Express.js", "NestJS", "Python", "Django", "Flask", "FastAPI",
  "Java", "Spring Boot", "C#", ".NET", "Ruby on Rails", "Go", "Rust", "C++", 
  "PHP", "Laravel", "GraphQL", "REST APIs", "gRPC", "WebSockets",

  // Databases
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
  "Cassandra", "DynamoDB", "Firebase", "Supabase", "Prisma", "Drizzle ORM",
  
  // DevOps & Cloud
  "AWS", "Google Cloud", "Microsoft Azure", "Docker", "Kubernetes",
  "Terraform", "CI/CD", "GitHub Actions", "Jenkins", "Linux", "Bash Scripting",
  "Nginx", "Apache", "Serverless", "Microservices",
  
  // CS Fundamentals & AI
  "Data Structures", "Algorithms", "System Architecture", "System Design",
  "Design Patterns", "Object-Oriented Programming", "Functional Programming",
  "Machine Learning", "Deep Learning", "Neural Networks", "NLP",
  "Computer Vision", "TensorFlow", "PyTorch", "OpenAI API", "LangChain",
  
  // Mobile, Game & Web3
  "Swift", "iOS Development", "Kotlin", "Android Development", "Flutter",
  "Unity", "Unreal Engine", "Game Development", "C",
  "Web3", "Solidity", "Smart Contracts", "Ethereum", "Blockchain",

  // Design & Product
  "UI/UX Design", "Figma", "Wireframing", "Prototyping", "Design Systems",
  "Agile Methodology", "Scrum", "Product Management"
];

export default function HomeScreen() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const addRoadmap = useRoadmapStore((s) => s.addRoadmap);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const [isFocused, setIsFocused] = useState(false);

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

    setIsLoading(true);
    setPrompt(trimmed); // Update input field to show what's being generated
    try {
      const roadmap = await generateRoadmap(trimmed);
      addRoadmap(roadmap);
      setPrompt("");
      router.push(`/roadmap/${roadmap.id}`);
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
      Alert.alert("Generation Failed", "An error occurred while generating your roadmap. Please check your network connection and try again.");
    } finally {
      setIsLoading(false);
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
    </View>
  );
}
