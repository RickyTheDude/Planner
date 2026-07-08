import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import Markdown from "@ronradtke/react-native-markdown-display";
import { useRoadmapStore } from "../../../src/store/useRoadmapStore";
import { SourcesModal } from "../../../src/components/SourcesModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MaterialScreen() {
  const { roadmapId, nodeId } = useLocalSearchParams<{
    roadmapId: string;
    nodeId: string;
  }>();
  const router = useRouter();
  const { height: screenHeight } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const roadmap = useRoadmapStore((s) =>
    s.getRoadmapById(roadmapId ?? "")
  );
  const markNodeCompleted = useRoadmapStore((s) => s.markNodeCompleted);
  const getNextNodeId = useRoadmapStore((s) => s.getNextNodeId);
  const getPrevNodeId = useRoadmapStore((s) => s.getPrevNodeId);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [sourcesVisible, setSourcesVisible] = useState(false);
  const [hasAutoCompleted, setHasAutoCompleted] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const node = roadmap?.nodes.find((n) => n.id === nodeId);
  const nodeIndex = roadmap?.nodes.findIndex((n) => n.id === nodeId) ?? -1;

  const nextId = getNextNodeId(roadmapId ?? "", nodeId ?? "");
  const prevId = getPrevNodeId(roadmapId ?? "", nodeId ?? "");

  // Reset auto-complete state when node changes
  useEffect(() => {
    setHasAutoCompleted(false);
    setScrollProgress(0);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [nodeId]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const totalScrollable = contentSize.height - layoutMeasurement.height;
      if (totalScrollable <= 0) {
        setScrollProgress(1);
        return;
      }
      const progress = Math.min(contentOffset.y / totalScrollable, 1);
      setScrollProgress(progress);

      // Auto-complete at 95%
      if (progress >= 0.95 && !hasAutoCompleted && roadmapId && nodeId) {
        setHasAutoCompleted(true);
        markNodeCompleted(roadmapId, nodeId);
      }
    },
    [hasAutoCompleted, roadmapId, nodeId, markNodeCompleted]
  );

  const navigateToNode = (targetNodeId: string | null) => {
    if (!targetNodeId || !roadmapId) return;
    router.setParams({ nodeId: targetNodeId });
  };

  if (!roadmap || !node) {
    return (
      <View className="flex-1 items-center justify-center bg-neoBg dark:bg-neoBgDark">
        <Text className="text-base font-mono text-neoFg/60 dark:text-neoFgDark/60">MATERIAL NOT FOUND</Text>
      </View>
    );
  }

  const fgColor = isDark ? "#f8fafc" : "#0f172a";
  const contrastBg = isDark ? "#1e293b" : "#ffffff";
  const lightBg = isDark ? "#0f172a" : "#f8fafc";
  const accentYellow = isDark ? "#d97706" : "#f59e0b"; // Amber
  const accentPink = isDark ? "#059669" : "#10b981"; // Emerald Green (Completion)
  const accentCyan = isDark ? "#6366f1" : "#818cf8"; // Indigo
  const trueCyan = isDark ? "#0891b2" : "#06b6d4"; // Cyan for tips

  const isDone = node.isCompleted || hasAutoCompleted;

  // Dynamic Markdown styling for neobrutalist aesthetic
  const markdownStyles = {
    body: {
      color: fgColor,
      fontSize: 16,
      lineHeight: 26,
      fontFamily: "SpaceGrotesk_400Regular",
    },
    heading1: {
      color: fgColor,
      fontSize: 26,
      fontFamily: "SpaceGrotesk_700Bold",
      marginTop: 24,
      marginBottom: 12,
      lineHeight: 34,
      textTransform: "uppercase" as const,
    },
    heading2: {
      color: fgColor,
      fontSize: 20,
      fontFamily: "SpaceGrotesk_700Bold",
      marginTop: 20,
      marginBottom: 10,
      lineHeight: 28,
      textTransform: "uppercase" as const,
    },
    heading3: {
      color: fgColor,
      fontSize: 17,
      fontFamily: "SpaceGrotesk_700Bold",
      marginTop: 16,
      marginBottom: 8,
      lineHeight: 24,
      textTransform: "uppercase" as const,
    },
    paragraph: {
      color: fgColor,
      fontSize: 15,
      lineHeight: 24,
      marginTop: 8,
      marginBottom: 8,
      fontFamily: "SpaceGrotesk_400Regular",
    },
    strong: {
      color: fgColor,
      fontFamily: "SpaceGrotesk_700Bold",
    },
    em: {
      color: fgColor,
      fontStyle: "italic" as const,
      opacity: 0.8,
    },
    link: {
      color: isDark ? "#60a5fa" : "#3b82f6",
      textDecorationLine: "underline" as const,
      fontFamily: "SpaceGrotesk_700Bold",
    },
    blockquote: {
      backgroundColor: trueCyan,
      borderColor: fgColor,
      borderWidth: 3,
      borderLeftWidth: 8,
      paddingLeft: 16,
      paddingVertical: 12,
      marginVertical: 16,
      borderRadius: 12,
    },
    code_inline: {
      backgroundColor: isDark ? "#242424" : "#f1f1f1",
      color: accentYellow,
      fontSize: 14,
      fontFamily: "monospace",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 1.5,
      borderColor: fgColor,
      borderRadius: 6,
    },
    code_block: {
      backgroundColor: contrastBg,
      color: fgColor,
      fontSize: 13,
      fontFamily: "monospace",
      lineHeight: 20,
      padding: 16,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: fgColor,
      marginVertical: 16,
    },
    fence: {
      backgroundColor: contrastBg,
      color: fgColor,
      fontSize: 13,
      fontFamily: "monospace",
      lineHeight: 20,
      padding: 16,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: fgColor,
      marginVertical: 16,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    list_item: {
      color: fgColor,
      fontSize: 15,
      lineHeight: 24,
      marginBottom: 4,
      fontFamily: "SpaceGrotesk_400Regular",
    },
    table: {
      borderColor: fgColor,
      borderWidth: 3,
      borderRadius: 12,
      marginVertical: 16,
      overflow: "hidden" as const,
    },
    thead: {
      backgroundColor: accentCyan,
    },
    th: {
      color: fgColor,
      fontSize: 13,
      fontFamily: "SpaceGrotesk_700Bold",
      padding: 10,
      borderColor: fgColor,
      borderWidth: 1.5,
    },
    td: {
      color: fgColor,
      fontSize: 13,
      fontFamily: "SpaceGrotesk_400Regular",
      padding: 10,
      borderColor: fgColor,
      borderWidth: 1.5,
    },
    tr: {
      borderColor: fgColor,
    },
    hr: {
      backgroundColor: fgColor,
      height: 3,
      marginVertical: 20,
    },
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: node.label,
          headerStyle: {
            backgroundColor: isDone ? accentPink : lightBg,
          },
          headerRight: () => (
            <View className={`rounded border-2 border-neoFg dark:border-neoFgDark ${isDone ? 'bg-neoBg dark:bg-neoBgDark' : 'bg-neoMain dark:bg-neoMainDark'} px-2 py-0.5 mr-2`}>
              <Text className="text-[10px] font-black text-neoFg dark:text-neoFgDark">
                {nodeIndex + 1}/{roadmap.nodes.length}
              </Text>
            </View>
          ),
        }}
      />

      {/* Progress bar */}
      <View
        className="bg-neoBg dark:bg-neoBgDark border-b-3 border-neoFg dark:border-neoFgDark"
        style={{ height: 10 }}
      >
        <View
          className="bg-neoPink dark:bg-neoPinkDark h-full"
          style={{
            width: `${scrollProgress * 100}%`,
          }}
        />
      </View>

      <View className="flex-1 bg-neoBg dark:bg-neoBgDark">
        <ScrollView
          ref={scrollViewRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Completion badge */}
          {node.isCompleted && (
            <View className="mb-6 flex-row items-center rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoPink dark:bg-neoPinkDark px-4 py-3 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#e8e8e8]">
              <Text className="mr-2 text-base font-space-bold text-neoFg dark:text-neoFgDark">✓</Text>
              <Text className="text-sm font-space-bold uppercase text-neoFg dark:text-neoFgDark">
                Module completed
              </Text>
            </View>
          )}

          <Markdown style={markdownStyles}>{node.material.markdownBody}</Markdown>
        </ScrollView>

        {/* Footer Navigation */}
        <View 
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}
          className="border-t-3 border-neoFg dark:border-neoFgDark bg-neoBg/95 dark:bg-neoBgDark/95 px-4 pt-4"
        >
          <View className="flex-row items-center justify-between">
            {/* Previous button wrapper */}
            <View className={`rounded-xl ${prevId ? "bg-neoFg dark:bg-neoFgDark" : "opacity-30"}`}>
              <Pressable
                onPress={() => navigateToNode(prevId)}
                disabled={!prevId}
                className="min-h-[46px] items-center justify-center rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark px-4 py-2 -translate-x-1 -translate-y-1 active:translate-x-0 active:translate-y-0"
              >
                <Text className="text-sm font-space-bold uppercase text-neoFg dark:text-neoFgDark">
                  ← Prev
                </Text>
              </Pressable>
            </View>

            {/* Sources button wrapper */}
            <View className="rounded-xl bg-neoFg dark:bg-neoFgDark">
              <Pressable
                onPress={() => setSourcesVisible(true)}
                className="min-h-[46px] items-center justify-center rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoCyan dark:bg-neoCyanDark px-5 py-2 -translate-x-1 -translate-y-1 active:translate-x-0 active:translate-y-0"
              >
                <Text className="text-sm font-space-bold uppercase text-neoFg dark:text-neoFgDark">
                  Sources ({node.material.sources.length})
                </Text>
              </Pressable>
            </View>

            {/* Next button wrapper */}
            <View className={`rounded-xl ${nextId ? "bg-neoFg dark:bg-neoFgDark" : "opacity-30"}`}>
              <Pressable
                onPress={() => navigateToNode(nextId)}
                disabled={!nextId}
                className={`min-h-[46px] items-center justify-center rounded-xl border-3 border-neoFg dark:border-neoFgDark px-4 py-2 -translate-x-1 -translate-y-1 ${
                  nextId
                    ? "bg-neoYellow dark:bg-neoYellowDark active:translate-x-0 active:translate-y-0"
                    : "bg-neoMain dark:bg-neoMainDark opacity-50"
                }`}
              >
                <Text
                  className={`text-sm font-space-bold uppercase ${
                    nextId ? "text-neoFg dark:text-neoFgDark" : "text-neoFg/30 dark:text-neoFgDark/30"
                  }`}
                >
                  Next →
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <SourcesModal
        visible={sourcesVisible}
        onClose={() => setSourcesVisible(false)}
        sources={node.material.sources}
      />
    </>
  );
}
