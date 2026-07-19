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
  Animated,
  PanResponder,
} from "react-native";
import { useColorScheme } from "nativewind";



import type { RenderRules } from "@ronradtke/react-native-markdown-display";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import Markdown from "@ronradtke/react-native-markdown-display";
import SyntaxHighlighter from "react-native-syntax-highlighter";
import { vs2015, docco } from "react-syntax-highlighter/styles/hljs";
import ConfettiCannon from "react-native-confetti-cannon";
import * as Haptics from 'expo-haptics';

import { useRoadmapStore } from "../../../src/store/useRoadmapStore";
import { useRoadmapStream } from "../../../src/hooks/useRoadmapStream";
import { SourcesModal } from "../../../src/components/SourcesModal";
import { MermaidBlock } from "../../../src/components/MermaidBlock";
import { YouTubeBlock } from "../../../src/components/YouTubeBlock";
import { ModuleLoadingSkeleton } from "../../../src/components/ModuleLoadingSkeleton";
import { StandingWaveLoader } from "../../../src/components/StandingWaveLoader";
import { resolveImageUrl } from "../../../src/services/imageService";
import { FluxImage } from "../../../src/components/FluxImage";
import { MathView } from "../../../src/components/MathView";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Math / LaTeX Utilities ───

type ContentSegment =
  | { type: 'markdown'; content: string }
  | { type: 'displaymath'; content: string };

/**
 * Converts inline LaTeX ($...$) to readable Unicode.
 * Display math ($$...$$) is handled separately by splitIntoMathSegments.
 */
function stripInlineMath(text: string): string {
  if (!text) return text;
  return text
    .replace(/\$([^$\n]+?)\$/g, (_m, inner: string) => latexToUnicode(inner.trim()))
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\mathrm\{([^}]*)\}/g, '$1')
    .replace(/\\mathbf\{([^}]*)\}/g, '$1')
    .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
    .replace(/\\left|\\right/g, '')
    .replace(/\\cdot/g, '·').replace(/\\times/g, '×')
    .replace(/\\div/g, '÷').replace(/\\pm/g, '±')
    .replace(/\\leq/g, '≤').replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠').replace(/\\approx/g, '≈')
    .replace(/\\infty/g, '∞').replace(/\\Delta/g, 'Δ')
    .replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ').replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π').replace(/\\mu/g, 'μ')
    .replace(/\\sigma/g, 'σ').replace(/\\lambda/g, 'λ')
    .replace(/\\rho/g, 'ρ').replace(/\\omega/g, 'ω')
    .replace(/\^\{([^}]*)\}/g, (_m, e: string) => {
      const s: Record<string, string> = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻','n':'ⁿ' };
      return e.length === 1 && s[e] ? s[e] : `^${e}`;
    })
    .replace(/\_\{([^}]*)\}/g, (_m, e: string) => {
      const s: Record<string, string> = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','+':'₊','-':'₋' };
      return e.length === 1 && s[e] ? s[e] : `_${e}`;
    })
    .replace(/\\(?=[A-Za-z])/g, '');
}

function latexToUnicode(expr: string): string {
  return expr
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
    .replace(/\\cdot/g, '·').replace(/\\times/g, '×')
    .replace(/\\leq/g, '≤').replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠').replace(/\\approx/g, '≈')
    .replace(/\\infty/g, '∞').replace(/\\Delta/g, 'Δ')
    .replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β')
    .replace(/\\pi/g, 'π').replace(/\\mu/g, 'μ')
    .replace(/\\sigma/g, 'σ').replace(/\\lambda/g, 'λ')
    .replace(/\^\{([^}]*)\}/g, '^$1')
    .replace(/\_\{([^}]*)\}/g, '_$1')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '');
}

/**
 * Splits a markdown body into alternating markdown-text and display-math segments.
 * Display math: $$...$$  — rendered via KaTeX (MathView).
 * Inline math:  $...$    — converted to unicode within the markdown text.
 */
function splitIntoMathSegments(text: string): ContentSegment[] {
  if (!text) return [];
  const segments: ContentSegment[] = [];
  // Split on $$...$$ blocks
  const parts = text.split(/(\$\$[\s\S]*?\$\$)/);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
      // Display math — extract inner expression
      const inner = part.slice(2, -2).trim();
      if (inner) segments.push({ type: 'displaymath', content: inner });
    } else {
      // Regular markdown — strip inline math to unicode
      const stripped = stripInlineMath(part);
      if (stripped.trim()) segments.push({ type: 'markdown', content: stripped });
    }
  }
  return segments.length > 0 ? segments : [{ type: 'markdown', content: stripInlineMath(text) }];
}


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
  const updateNodeScrollProgress = useRoadmapStore((s) => s.updateNodeScrollProgress);
  const fontSizeMultiplier = useRoadmapStore((s) => s.fontSizeMultiplier);
  const setFontSizeMultiplier = useRoadmapStore((s) => s.setFontSizeMultiplier);

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

  // ─── Fast Scrollbar State ───
  const scrollbarOpacity = useRef(new Animated.Value(0)).current;
  const scrollbarY = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<any | null>(null);
  const isDragging = useRef(false);
  const bubbleHeight = 40;
  
  // ─── Reading Progress Tracking ───
  const maxScrollRef = useRef(node?.maxScrollProgress || 0);
  const isFrontierRef = useRef(false);
  const [isFrontier, setIsFrontier] = useState(false);
  const [showFontControls, setShowFontControls] = useState(false);

  // ─── Snapping State ───
  const headingsRef = useRef<{ id: string; y: number }[]>([]);
  const markdownYRef = useRef(0);
  const lastSnappedIdRef = useRef<string | null>(null);
  const lastActiveHeadingRef = useRef<string | null>(null);

  const showScrollbar = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    Animated.timing(scrollbarOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    
    if (!isDragging.current) {
      hideTimeout.current = setTimeout(() => {
        Animated.timing(scrollbarOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        setShowFontControls(false); // Hide controls when scrollbar hides

        if (roadmapId && nodeId) {
          updateNodeScrollProgress(roadmapId, nodeId, maxScrollRef.current);
        }
      }, 1500);
    }
  }, [scrollbarOpacity, roadmapId, nodeId, updateNodeScrollProgress]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          isDragging.current = true;
          showScrollbar();
          scrollbarY.extractOffset();
        },
        onPanResponderMove: Animated.event(
          [null, { dy: scrollbarY }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: (e, gestureState) => {
          scrollbarY.flattenOffset();
          isDragging.current = false;
          showScrollbar();
          
          if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
            setShowFontControls((prev) => !prev);
          } else {
            setShowFontControls(false);
          }
        },
      }),
    [showScrollbar, scrollbarY]
  );

  useEffect(() => {
    const id = scrollbarY.addListener(({ value }) => {
      if (layoutHeight && contentHeight) {
        const trackHeight = layoutHeight - bubbleHeight;
        const maxScroll = contentHeight - layoutHeight;
        if (trackHeight > 0 && maxScroll > 0) {
          const clampedValue = Math.max(0, Math.min(trackHeight, value));
          const percentage = clampedValue / trackHeight;
          
          if (isDragging.current) {
            let targetY = percentage * maxScroll;
            
            // Snapping Logic
            const SNAP_THRESHOLD = 150; // increased for stronger magnetism while skimming
            let snapped = false;
            let snappedId = null;

            for (const heading of headingsRef.current) {
              const headingScrollY = markdownYRef.current + heading.y - 20; // 20px padding
              if (Math.abs(targetY - headingScrollY) < SNAP_THRESHOLD) {
                targetY = headingScrollY;
                snapped = true;
                snappedId = heading.id;
                break;
              }
            }

            if (snapped && lastSnappedIdRef.current !== snappedId) {
              Haptics.selectionAsync(); // Subtle haptic bump
              lastSnappedIdRef.current = snappedId;
            } else if (!snapped && lastSnappedIdRef.current !== null) {
              lastSnappedIdRef.current = null;
            }

            scrollViewRef.current?.scrollTo({
              y: targetY,
              animated: false,
            });

            // Update frontier status while dragging
            const threshold = maxScrollRef.current - 0.01;
            const currentIsFrontier = percentage >= threshold;
            if (currentIsFrontier !== isFrontierRef.current) {
              isFrontierRef.current = currentIsFrontier;
              setIsFrontier(currentIsFrontier);
            }
            if (percentage > maxScrollRef.current) {
              maxScrollRef.current = percentage;
            }
          }
        }
      }
    });
    return () => {
      scrollbarY.removeListener(id);
    };
  }, [layoutHeight, contentHeight, scrollbarY]);

  // Sync on unmount
  useEffect(() => {
    return () => {
      if (roadmapId && nodeId) {
        updateNodeScrollProgress(roadmapId, nodeId, maxScrollRef.current);
      }
    };
  }, [roadmapId, nodeId, updateNodeScrollProgress]);

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
    const context = `This is module ${node.index + 1} (index ${node.index}) of the "${roadmap?.topic}" roadmap. ${prereqs}. IMPORTANT: When writing math equations, use proper LaTeX formatting: use $$...$$ for display equations and $...$ for inline math. ALSO IMPORTANT: For Mermaid diagrams, NEVER use colons, parentheses, or special characters inside node labels. Keep node labels as simple alphanumeric text (e.g., use A[Curve f of x] instead of A[Curve: f(x)]) to prevent syntax errors. When a visual explanation or deeper dive is helpful (especially for math, physics, or complex topics), provide a highly relevant YouTube Search Query (e.g., "CrashCourse Quantum Mechanics"). Format it using a markdown code block with the language identifier "youtube", containing ONLY the search query inside (do not include URLs or video IDs). CRITICAL: When writing code snippets, ALWAYS wrap them in markdown code blocks with the correct language identifier (e.g., \`\`\`python, \`\`\`java) for syntax highlighting.`;

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
    scrollbarY.setValue(0);
    hasTriggeredFetch.current = false;

    // Reset progress tracking for new node
    maxScrollRef.current = useRoadmapStore.getState().roadmaps.find(r => r.id === roadmapId)?.nodes.find(n => n.id === nodeId)?.maxScrollProgress || 0;
    isFrontierRef.current = false;
    setIsFrontier(false);

    headingsRef.current = [];
    lastSnappedIdRef.current = null;
    lastActiveHeadingRef.current = null;

    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [nodeId, roadmapId, scrollbarY]);



  // Check if content fits when contentHeight or layoutHeight changes
  useEffect(() => {
    if (contentHeight > 0 && layoutHeight > 0) {
      const totalScrollable = contentHeight - layoutHeight;
      if (totalScrollable <= 120 && !hasAutoCompleted && !node?.isCompleted && roadmapId && nodeId) {
        setHasAutoCompleted(true);
        markNodeCompleted(roadmapId, nodeId);
        triggerCompletionHaptics();
        if (!nextId) {
          setShowConfetti(true);
        }
      }
    }
  }, [contentHeight, layoutHeight, hasAutoCompleted, node?.isCompleted, roadmapId, nodeId, markNodeCompleted, nextId]);

  const triggerCompletionHaptics = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 400);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      
      let currentPercentage = 0;
      if (contentSize.height > layoutMeasurement.height) {
        const scrollableHeight = contentSize.height - layoutMeasurement.height;
        currentPercentage = Math.max(0, Math.min(1, contentOffset.y / scrollableHeight));
        
        if (!isDragging.current) {
          const trackHeight = layoutMeasurement.height - bubbleHeight;
          scrollbarY.setValue(currentPercentage * trackHeight);
        }
      }

      // Check normal scroll heading haptics
      if (!isDragging.current) {
        const scrollYVal = contentOffset.y;
        let activeId = null;
        for (let i = headingsRef.current.length - 1; i >= 0; i--) {
          const heading = headingsRef.current[i];
          const headingScrollY = markdownYRef.current + heading.y - 20;
          if (scrollYVal >= headingScrollY - 10) {
            activeId = heading.id;
            break;
          }
        }
        if (activeId !== lastActiveHeadingRef.current) {
          if (activeId !== null) {
            Haptics.selectionAsync();
          }
          lastActiveHeadingRef.current = activeId;
        }
      }

      // Check frontier status
      const threshold = maxScrollRef.current - 0.01;
      const currentIsFrontier = currentPercentage >= threshold;
      if (currentIsFrontier !== isFrontierRef.current) {
        isFrontierRef.current = currentIsFrontier;
        setIsFrontier(currentIsFrontier);
      }
      if (currentPercentage > maxScrollRef.current) {
        maxScrollRef.current = currentPercentage;
      }

      showScrollbar();

      // Increase threshold to 150 to make completion trigger more reliably when entering the bottom padding area
      const reachedBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 150;

      if (reachedBottom && !hasAutoCompleted && !node?.isCompleted && roadmapId && nodeId) {
        setHasAutoCompleted(true);
        markNodeCompleted(roadmapId, nodeId);
        triggerCompletionHaptics();
        if (!nextId) {
          setShowConfetti(true);
        }
      }
    },
    [hasAutoCompleted, node?.isCompleted, roadmapId, nodeId, markNodeCompleted, nextId, showScrollbar, scrollbarY]
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
  const isContentLoading = node.contentStatus === 'loading' || (node.contentStatus === 'idle' && !streamError);
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
        fontSize: 16 * fontSizeMultiplier,
        lineHeight: 26 * fontSizeMultiplier,
        fontFamily: "SpaceGrotesk_400Regular",
      },
      heading1: {
        color: fgColor,
        fontSize: 26 * fontSizeMultiplier,
        fontFamily: "SpaceGrotesk_700Bold",
        marginTop: 24,
        marginBottom: 12,
        lineHeight: 34 * fontSizeMultiplier,
        textTransform: "uppercase" as const,
      },
      heading2: {
        color: fgColor,
        fontSize: 20 * fontSizeMultiplier,
        fontFamily: "SpaceGrotesk_700Bold",
        marginTop: 20,
        marginBottom: 10,
        lineHeight: 28 * fontSizeMultiplier,
        textTransform: "uppercase" as const,
      },
      heading3: {
        color: fgColor,
        fontSize: 17 * fontSizeMultiplier,
        fontFamily: "SpaceGrotesk_700Bold",
        marginTop: 16,
        marginBottom: 8,
        lineHeight: 24 * fontSizeMultiplier,
        textTransform: "uppercase" as const,
      },
      paragraph: {
        color: fgColor,
        fontSize: 15 * fontSizeMultiplier,
        lineHeight: 24 * fontSizeMultiplier,
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
        fontSize: 14 * fontSizeMultiplier,
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
        fontSize: 13 * fontSizeMultiplier,
        fontFamily: "monospace",
        lineHeight: 20 * fontSizeMultiplier,
        padding: 16,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: fgColor,
        marginVertical: 16,
      },
      fence: {
        backgroundColor: contrastBg,
        color: fgColor,
        fontSize: 13 * fontSizeMultiplier,
        fontFamily: "monospace",
        lineHeight: 20 * fontSizeMultiplier,
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
        fontSize: 15 * fontSizeMultiplier,
        lineHeight: 24 * fontSizeMultiplier,
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
    fontSizeMultiplier,
  ]);

  const handleHeadingLayout = useCallback((key: string, y: number) => {
    const existing = headingsRef.current.find((b) => b.id === key);
    if (existing && existing.y === y) return;
    headingsRef.current = headingsRef.current.filter((b) => b.id !== key);
    headingsRef.current.push({ id: key, y });
    headingsRef.current.sort((a, b) => a.y - b.y);
  }, []);

  // Custom rules to force correct text color inside code blocks and capture headings
  const markdownRules = useMemo<RenderRules>(() => ({
    heading1: (node, children, _parent, styles) => (
      <View
        key={node.key}
        onLayout={(e) => handleHeadingLayout(node.key, e.nativeEvent.layout.y)}
      >
        <Text style={styles.heading1}>{children}</Text>
      </View>
    ),
    heading2: (node, children, _parent, styles) => (
      <View
        key={node.key}
        onLayout={(e) => handleHeadingLayout(node.key, e.nativeEvent.layout.y)}
      >
        <Text style={styles.heading2}>{children}</Text>
      </View>
    ),
    heading3: (node, children, _parent, styles) => (
      <View
        key={node.key}
        onLayout={(e) => handleHeadingLayout(node.key, e.nativeEvent.layout.y)}
      >
        <Text style={styles.heading3}>{children}</Text>
      </View>
    ),
    fence: (node, _children, _parent, styles) => {
      const sourceInfo = String(node.sourceInfo ?? '').trim();
      const lang = sourceInfo.split(/\s+/)[0].toLowerCase();
      
      const titleMatch = sourceInfo.match(/title="([^"]+)"/i);
      const title = titleMatch ? titleMatch[1] : undefined;

      if (lang === 'mermaid') {
        return (
          <MermaidBlock
            key={node.key}
            code={node.content ?? ''}
            title={title}
          />
        );
      }
      if (lang === 'youtube') {
        return (
          <YouTubeBlock
            key={node.key}
            code={node.content ?? ''}
          />
        );
      }
      return (
        <View key={node.key} style={{ marginVertical: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 3, borderColor: fgColor }}>
          <SyntaxHighlighter
            language={lang || 'text'}
            style={isDark ? vs2015 : docco}
            highlighter="hljs"
            fontFamily="monospace"
            fontSize={13 * fontSizeMultiplier}
            customStyle={{ padding: 16, margin: 0, backgroundColor: contrastBg }}
            CodeTag={Text}
            PreTag={View}
          >
            {node.content}
          </SyntaxHighlighter>
        </View>
      );
    },
    code_block: (node, _children, _parent, styles) => (
      <View key={node.key} style={{ marginVertical: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 3, borderColor: fgColor }}>
        <SyntaxHighlighter
          language="text"
          style={isDark ? vs2015 : docco}
          highlighter="hljs"
          fontFamily="monospace"
          fontSize={13 * fontSizeMultiplier}
          customStyle={{ padding: 16, margin: 0, backgroundColor: contrastBg }}
          CodeTag={Text}
          PreTag={View}
        >
          {node.content}
        </SyntaxHighlighter>
      </View>
    ),
  }), [contrastBg, fgColor, fontSizeMultiplier, isDark]);

  // ─── Sources from content ───
  const sources = content?.sources ?? [];

  // ─── Render resolved images ───
  const images = content?.imageQueries ?? [];

  // Split content into markdown + display-math segments for KaTeX rendering
  const memoizedContent = useMemo(() => {
    if (!content?.markdownBody) return null;
    const segments = splitIntoMathSegments(content.markdownBody);
    return (
      <>
        {segments.map((seg, idx) =>
          seg.type === 'displaymath' ? (
            <MathView key={`math-${idx}`} expression={seg.content} />
          ) : (
            <Markdown key={`md-${idx}`} style={markdownStyles} rules={markdownRules}>
              {seg.content}
            </Markdown>
          )
        )}
      </>
    );
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
            <View className="pt-6 pb-2 items-center opacity-70 w-full">
              <StandingWaveLoader width={screenWidth} height={24} />
            </View>
            <ModuleLoadingSkeleton />
          </ScrollView>
        ) : streamError ? (
          // ─── Error State ───
          <View className="flex-1 items-center justify-center p-6">
            <View className="w-full rounded-xl border-4 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark p-6 shadow-neo-sm dark:shadow-neoDark-sm">
              <Text className="text-xl font-space-bold text-[#b91c1c] dark:text-[#fca5a5] uppercase mb-2">
                Generation Failed
              </Text>
              <Text className="text-sm font-space text-neoFg/70 dark:text-neoFgDark/70 mb-4">
                {streamError}
              </Text>
              <Pressable
                onPress={() => {
                  hasTriggeredFetch.current = false;
                  useRoadmapStore.getState().setModuleStatus(roadmapId!, nodeId!, 'idle');
                }}
                className="rounded-lg border-2 border-neoFg dark:border-neoFgDark bg-neoYellow dark:bg-neoYellowDark px-4 py-3 items-center"
              >
                <Text className="text-sm font-space-bold uppercase text-neoFg dark:text-neoFgDark">
                  Retry
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          // ─── Content Loaded ───
          <View className="flex-1">
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


            {/* Key Takeaways */}
            {content?.keyTakeaways && content.keyTakeaways.length > 0 && (
              <View className="mb-4 rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoYellow/20 dark:bg-neoYellowDark/20 p-4">
                <Text className="text-xs font-space-bold uppercase tracking-wider text-neoFg dark:text-neoFgDark mb-2">
                  Key Takeaways
                </Text>
                {content.keyTakeaways.map((takeaway, i) => {
                  const segments = splitIntoMathSegments(takeaway);
                  return (
                    <View key={i} className="flex-row items-start mb-2">
                      <Text className="text-xs font-space-bold text-neoFg dark:text-neoFgDark mr-2 mt-[2px]">•</Text>
                      <View className="flex-1">
                        {segments.map((seg, idx) => 
                          seg.type === 'displaymath' ? (
                            <View key={`math-${i}-${idx}`} className="-my-1 w-full">
                              <MathView expression={seg.content} />
                            </View>
                          ) : (
                            <Text key={`text-${i}-${idx}`} className="text-sm font-space text-neoFg dark:text-neoFgDark leading-5">
                              {seg.content}
                            </Text>
                          )
                        )}
                      </View>
                    </View>
                  );
                })}
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

            {/* Markdown body (with KaTeX display-math blocks) */}
            <View onLayout={(e) => markdownYRef.current = e.nativeEvent.layout.y}>
              {memoizedContent}
            </View>

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

            {/* 
              Images temporarily disabled for beta release (backend 500 error on Hugging Face FLUX)
              
            {images.length > 0 && (
              <View className="mt-4">
                {images.map((img, i) => (
                  <View
                    key={`img-${i}`}
                    className="mb-4 rounded-xl border-3 border-neoFg dark:border-neoFgDark overflow-hidden"
                  >
                    <FluxImage query={img.query} alt={img.alt} />
                    <View className="px-3 py-2 bg-neoMain dark:bg-neoMainDark border-t-2 border-neoFg/20 dark:border-neoFgDark/20">
                      <Text className="text-[10px] font-mono text-neoFg/60 dark:text-neoFgDark/60">
                        {img.alt}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            */}

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

          {/* Fast Scrollbar Bubble */}
          {!isContentLoading && contentHeight > layoutHeight && (
            <Animated.View
              style={{
                position: 'absolute',
                right: 8,
                top: 0,
                height: bubbleHeight,
                opacity: scrollbarOpacity,
                transform: [{
                  translateY: scrollbarY.interpolate({
                    inputRange: [0, Math.max(1, layoutHeight - bubbleHeight)],
                    outputRange: [0, Math.max(1, layoutHeight - bubbleHeight)],
                    extrapolate: 'clamp',
                  })
                }],
                zIndex: 50,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {showFontControls && (
                <View className="mr-2 flex-row items-center bg-neoCyan dark:bg-neoCyanDark rounded-full border-3 border-neoFg dark:border-neoFgDark px-1 py-1 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#e8e8e8]">
                  <Pressable 
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFontSizeMultiplier(Math.max(0.7, fontSizeMultiplier - 0.1));
                      showScrollbar();
                    }}
                    className="w-8 h-8 mr-1 items-center justify-center rounded-full bg-white/20 active:bg-white/40"
                  >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center', includeFontPadding: false, marginBottom: 2 }}>a</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFontSizeMultiplier(Math.min(1.5, fontSizeMultiplier + 0.1));
                      showScrollbar();
                    }}
                    className="w-8 h-8 items-center justify-center rounded-full bg-white/20 active:bg-white/40"
                  >
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', includeFontPadding: false, marginBottom: 2 }}>A</Text>
                  </Pressable>
                </View>
              )}
              <View
                {...panResponder.panHandlers}
                className={`w-8 h-full rounded-full border-3 border-neoFg dark:border-neoFgDark items-center justify-center shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#e8e8e8] ${
                  isFrontier ? 'bg-neoPink dark:bg-neoPinkDark' : 'bg-neoCyan dark:bg-neoCyanDark'
                }`}
              >
                <View className="w-1.5 h-1.5 rounded-full bg-neoBg dark:bg-neoBgDark mb-1" />
                <View className="w-1.5 h-1.5 rounded-full bg-neoBg dark:bg-neoBgDark mb-1" />
                <View className="w-1.5 h-1.5 rounded-full bg-neoBg dark:bg-neoBgDark" />
              </View>
            </Animated.View>
          )}
        </View>
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

            {/* Next button wrapper – opacity via style, no disabled prop to avoid gesture responder crash */}
            <View
              className="rounded-xl bg-neoFg dark:bg-neoFgDark"
              style={{ opacity: node?.isCompleted ? 1 : 0.3 }}
            >
              <Pressable
                onPress={() => {
                  if (!node?.isCompleted) return;
                  if (nextId) {
                    navigateToNode(nextId);
                  } else {
                    router.back();
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
