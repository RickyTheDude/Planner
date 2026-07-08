import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from "react-native";
import { useColorScheme } from "nativewind";
import type { RenderRules } from "@ronradtke/react-native-markdown-display";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import Markdown from "@ronradtke/react-native-markdown-display";
import ConfettiCannon from "react-native-confetti-cannon";

import { useRoadmapStore } from "../../../src/store/useRoadmapStore";
import { useRoadmapStream } from "../../../src/hooks/useRoadmapStream";
import { SourcesModal } from "../../../src/components/SourcesModal";
import { MermaidBlock } from "../../../src/components/MermaidBlock";
import { ModuleLoadingSkeleton } from "../../../src/components/ModuleLoadingSkeleton";
import { resolveImageUrl } from "../../../src/services/imageService";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MaterialScreen() {
  const { roadmapId, nodeId } = useLocalSearchParams<{
    roadmapId: string;
    nodeId: string;
  }>();
  const router = useRouter();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const roadmap = useRoadmapStore((s) =>
    s.getRoadmapById(roadmapId ?? "")
  );
  const markNodeCompleted = useRoadmapStore((s) => s.markNodeCompleted);
  const getNextNodeId = useRoadmapStore((s) => s.getNextNodeId);
  const getPrevNodeId = useRoadmapStore((s) => s.getPrevNodeId);

  const { generateModuleContent, error: streamError } = useRoadmapStream();

  const [sourcesVisible, setSourcesVisible] = useState(false);
  const [hasAutoCompleted, setHasAutoCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const hasTriggeredFetch = useRef(false);

  const node = roadmap?.nodes.find((n) => n.id === nodeId);
  const nodeIndex = roadmap?.nodes.findIndex((n) => n.id === nodeId) ?? -1;

  const nextId = getNextNodeId(roadmapId ?? "", nodeId ?? "");
  const prevId = getPrevNodeId(roadmapId ?? "", nodeId ?? "");

  // ─── Phase 2: On-demand content loading ───
  useEffect(() => {
    if (!node || !roadmapId || !nodeId) return;
    if (node.contentStatus !== 'idle') return;
    if (hasTriggeredFetch.current) return;

    hasTriggeredFetch.current = true;

    // Build context string for the API
    const prereqs = node.prerequisites?.length
      ? `Prerequisites: ${node.prerequisites.join(', ')}`
      : 'No prerequisites';
    const context = `This is module ${node.index + 1} (index ${node.index}) of the "${roadmap?.topic}" roadmap. ${prereqs}.`;

    generateModuleContent(
      roadmapId,
      nodeId,
      node.label,
      roadmap?.topic ?? '',
      context
    );
  }, [node?.contentStatus, roadmapId, nodeId]);

  // Reset state when node changes
  useEffect(() => {
    setHasAutoCompleted(false);
    setShowConfetti(false);
    setContentHeight(0);
    hasTriggeredFetch.current = false;
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [nodeId]);

  // Check if content fits when contentHeight or layoutHeight changes
  useEffect(() => {
    if (contentHeight > 0 && layoutHeight > 0) {
      const totalScrollable = contentHeight - layoutHeight;
      if (totalScrollable <= 120 && !hasAutoCompleted && !node?.isCompleted && roadmapId && nodeId) {
        setHasAutoCompleted(true);
        markNodeCompleted(roadmapId, nodeId);
        if (!nextId) {
          setShowConfetti(true);
        }
      }
    }
  }, [contentHeight, layoutHeight, hasAutoCompleted, node?.isCompleted, roadmapId, nodeId, markNodeCompleted, nextId]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const reachedBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;

      if (reachedBottom && !hasAutoCompleted && !node?.isCompleted && roadmapId && nodeId) {
        setHasAutoCompleted(true);
        markNodeCompleted(roadmapId, nodeId);
        if (!nextId) {
          setShowConfetti(true);
        }
      }
    },
    [hasAutoCompleted, node?.isCompleted, roadmapId, nodeId, markNodeCompleted, nextId]
  );

  const navigateToNode = (targetNodeId: string | null) => {
    if (!targetNodeId || !roadmapId) return;
    router.replace(`/material/${roadmapId}/${targetNodeId}`);
  };

  if (!roadmap || !node) {
    return (
      <View className="flex-1 items-center justify-center bg-neoBg dark:bg-neoBgDark">
        <Text className="text-base font-mono text-neoFg/60 dark:text-neoFgDark/60">MATERIAL NOT FOUND</Text>
      </View>
    );
  }

  // ─── Derived state ───
  const isContentLoading = node.contentStatus === 'idle' || node.contentStatus === 'loading';
  const hasContent = node.contentStatus === 'complete' && !!node.content;
  const content = node.content;

  const fgColor = isDark ? "#f8fafc" : "#0f172a";
  const contrastBg = isDark ? "#1e293b" : "#ffffff";
  const lightBg = isDark ? "#000000" : "#ffffff";
  const accentYellow = isDark ? "#d97706" : "#f59e0b";
  const accentPink = isDark ? "#059669" : "#10b981";
  const accentCyan = isDark ? "#6366f1" : "#818cf8";
  const trueCyan = isDark ? "#0891b2" : "#06b6d4";

  const isDone = node.isCompleted || hasAutoCompleted;

  // Dynamic Markdown styling for neobrutalist aesthetic
  const markdownStyles = useMemo(() => {
    return {
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
  }, [
    fgColor,
    contrastBg,
    isDark,
    accentYellow,
    trueCyan,
    accentCyan,
  ]);

  // Custom rules to force correct text color inside code blocks
  const markdownRules = useMemo<RenderRules>(() => ({
    fence: (node, _children, _parent, styles) => (
      <View
        key={node.key}
        style={[
          styles.fence,
          {
            backgroundColor: contrastBg,
            borderColor: fgColor,
          },
        ]}
      >
        <Text
          style={{
            color: fgColor,
            fontSize: 13,
            fontFamily: "monospace",
            lineHeight: 20,
          }}
        >
          {node.content}
        </Text>
      </View>
    ),
    code_block: (node, _children, _parent, styles) => (
      <View
        key={node.key}
        style={[
          styles.code_block,
          {
            backgroundColor: contrastBg,
            borderColor: fgColor,
          },
        ]}
      >
        <Text
          style={{
            color: fgColor,
            fontSize: 13,
            fontFamily: "monospace",
            lineHeight: 20,
          }}
        >
          {node.content}
        </Text>
      </View>
    ),
  }), [contrastBg, fgColor]);

  // ─── Sources from content ───
  const sources = content?.sources ?? [];

  // ─── Render resolved images ───
  const heroImage = content?.imageQueries?.find((q) => q.placement === 'hero');
  const inlineImages = content?.imageQueries?.filter((q) => q.placement !== 'hero') ?? [];

  const memoizedMarkdown = useMemo(() => {
    if (!content?.markdownBody) return null;
    return <Markdown style={markdownStyles} rules={markdownRules}>{content.markdownBody}</Markdown>;
  }, [markdownStyles, markdownRules, content?.markdownBody]);

  return (
    <>
      <Stack.Screen
        options={{
          title: node.label,
          animation: "none",
          headerStyle: {
            backgroundColor: lightBg,
          },
          headerRight: () => (
            <View className={`rounded border-2 border-neoFg dark:border-neoFgDark ${isDone ? 'bg-neoPink dark:bg-neoPinkDark' : 'bg-neoMain dark:bg-neoMainDark'} px-2 py-0.5 mr-2`}>
              <Text className="text-[10px] font-black text-neoFg dark:text-neoFgDark">
                {isDone ? "✓ DONE" : `${nodeIndex + 1}/${roadmap.nodes.length}`}
              </Text>
            </View>
          ),
        }}
      />

      <View className="flex-1 bg-neoBg dark:bg-neoBgDark">
        {isContentLoading ? (
          // ─── Loading Skeleton ───
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Loading header */}
            <View className="px-5 pt-4 pb-2">
              <View className="flex-row items-center">
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isDark ? '#d97706' : '#f59e0b',
                    marginRight: 8,
                  }}
                />
                <Text className="text-xs font-space-bold uppercase tracking-wider text-neoFg/50 dark:text-neoFgDark/50">
                  Generating content...
                </Text>
              </View>
            </View>
            <ModuleLoadingSkeleton />

            {streamError && (
              <View className="mx-5 mt-4 p-4 rounded-xl border-3 border-red-500 bg-red-500/10">
                <Text className="text-sm font-space-bold text-red-500 uppercase mb-1">
                  Generation Failed
                </Text>
                <Text className="text-xs font-space text-neoFg/70 dark:text-neoFgDark/70">
                  {streamError}
                </Text>
                <Pressable
                  onPress={() => {
                    hasTriggeredFetch.current = false;
                    // Reset to idle to re-trigger fetch
                    useRoadmapStore.getState().setModuleStatus(roadmapId!, nodeId!, 'idle');
                  }}
                  className="mt-3 self-start rounded-lg border-2 border-neoFg dark:border-neoFgDark bg-neoYellow dark:bg-neoYellowDark px-4 py-2"
                >
                  <Text className="text-xs font-space-bold uppercase text-neoFg dark:text-neoFgDark">
                    Retry
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        ) : (
          // ─── Content Loaded ───
          <ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            scrollEventThrottle={32}
            removeClippedSubviews={true}
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 120,
            }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={(_, h) => setContentHeight(h)}
            onLayout={(e) => setLayoutHeight(e.nativeEvent.layout.height)}
          >
            {/* Hero image */}
            {heroImage && (
              <View className="mb-4 rounded-xl border-3 border-neoFg dark:border-neoFgDark overflow-hidden">
                <Image
                  source={{ uri: resolveImageUrl(heroImage.query) }}
                  style={{ width: '100%' as any, height: 200 }}
                  resizeMode="cover"
                  accessibilityLabel={heroImage.alt}
                />
              </View>
            )}

            {/* Key Takeaways */}
            {content?.keyTakeaways && content.keyTakeaways.length > 0 && (
              <View className="mb-4 rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoYellow/20 dark:bg-neoYellowDark/20 p-4">
                <Text className="text-xs font-space-bold uppercase tracking-wider text-neoFg dark:text-neoFgDark mb-2">
                  Key Takeaways
                </Text>
                {content.keyTakeaways.map((takeaway, i) => (
                  <View key={i} className="flex-row items-start mb-1.5">
                    <Text className="text-xs font-space-bold text-neoFg dark:text-neoFgDark mr-2">•</Text>
                    <Text className="flex-1 text-sm font-space text-neoFg dark:text-neoFgDark leading-5">
                      {takeaway}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Estimated reading time */}
            {content?.estimatedMinutes ? (
              <View className="mb-3">
                <Text className="text-[10px] font-mono text-neoFg/40 dark:text-neoFgDark/40 uppercase">
                  ≈ {content.estimatedMinutes} min read
                </Text>
              </View>
            ) : null}

            {/* Markdown body */}
            {memoizedMarkdown}

            {/* Mermaid diagrams */}
            {content?.mermaidDiagrams && content.mermaidDiagrams.length > 0 && (
              <View className="mt-4">
                {content.mermaidDiagrams.map((diagram, i) => (
                  <MermaidBlock
                    key={`mermaid-${i}`}
                    code={diagram.code}
                    title={diagram.title}
                  />
                ))}
              </View>
            )}

            {/* Inline images */}
            {inlineImages.length > 0 && (
              <View className="mt-4">
                {inlineImages.map((img, i) => (
                  <View
                    key={`img-${i}`}
                    className="mb-4 rounded-xl border-3 border-neoFg dark:border-neoFgDark overflow-hidden"
                  >
                    <Image
                      source={{ uri: resolveImageUrl(img.query) }}
                      style={{ width: '100%' as any, height: 200 }}
                      resizeMode="cover"
                      accessibilityLabel={img.alt}
                    />
                    <View className="px-3 py-2 bg-neoMain dark:bg-neoMainDark border-t-2 border-neoFg/20 dark:border-neoFgDark/20">
                      <Text className="text-[10px] font-mono text-neoFg/60 dark:text-neoFgDark/60">
                        {img.alt}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Completion badge */}
            {node.isCompleted && (
              <View className="mt-6 flex-row items-center rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoPink dark:bg-neoPinkDark px-4 py-3 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#e8e8e8]">
                <Text className="mr-2 text-base font-space-bold text-neoFg dark:text-neoFgDark">✓</Text>
                <Text className="text-sm font-space-bold uppercase text-neoFg dark:text-neoFgDark">
                  Module completed
                </Text>
              </View>
            )}
          </ScrollView>
        )}

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
            <View className={`rounded-xl ${hasContent ? "bg-neoFg dark:bg-neoFgDark" : "opacity-30"}`}>
              <Pressable
                onPress={() => setSourcesVisible(true)}
                disabled={!hasContent}
                className="min-h-[46px] items-center justify-center rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoCyan dark:bg-neoCyanDark px-5 py-2 -translate-x-1 -translate-y-1 active:translate-x-0 active:translate-y-0"
              >
                <Text className="text-sm font-space-bold uppercase text-neoFg dark:text-neoFgDark">
                  Sources ({sources.length})
                </Text>
              </Pressable>
            </View>

            {/* Next button wrapper */}
            <View className="rounded-xl bg-neoFg dark:bg-neoFgDark">
              <Pressable
                onPress={() => {
                  if (nextId) {
                    navigateToNode(nextId);
                  } else {
                    router.navigate(`/roadmap/${roadmapId}`);
                  }
                }}
                className="min-h-[46px] items-center justify-center rounded-xl border-3 border-neoFg dark:border-neoFgDark px-4 py-2 -translate-x-1 -translate-y-1 bg-neoYellow dark:bg-neoYellowDark active:translate-x-0 active:translate-y-0"
              >
                <Text className="text-sm font-space-bold uppercase text-neoFg dark:text-neoFgDark">
                  {nextId ? "Next →" : "Map"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <SourcesModal
        visible={sourcesVisible}
        onClose={() => setSourcesVisible(false)}
        sources={sources}
      />

      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: screenWidth / 2, y: -20 }}
          autoStart={true}
          fadeOut={true}
        />
      )}
    </>
  );
}
