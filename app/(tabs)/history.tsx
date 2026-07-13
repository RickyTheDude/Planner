import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useRoadmapStore } from "../../src/store/useRoadmapStore";
import Svg, { Path, Circle } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  measure,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const TrashIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18" />
    <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </Svg>
);

function getRelativeTime(timestamp: number): string {
  if (!timestamp) return "Just now";
  const diff = Date.now() - timestamp;
  if (isNaN(diff)) return "Just now";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function getCompletionPercent(nodes?: { isCompleted: boolean }[]): number {
  if (!nodes || nodes.length === 0) return 0;
  const completed = nodes.filter((n) => n.isCompleted).length;
  return Math.round((completed / nodes.length) * 100);
}

const ITEM_HEIGHT = 120; // 100 card + 20 margin gap
const TRASH_SIZE = 72;

// Haptic helpers (JS thread)
function hapticSort() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function hapticDelete() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 80);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 140);
}

function hapticEnterTrash() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

interface TrashZone {
  x: number;
  y: number;
  size: number;
}

interface SortableCardProps {
  roadmap: any;
  id: string;
  initialOrder: number;
  positions: SharedValue<Record<string, number>>;
  draggedAbsoluteX: SharedValue<number>;
  draggedAbsoluteY: SharedValue<number>;
  trashRef: any;
  isOverTrash: SharedValue<boolean>;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, isDelete: boolean, newPositions?: Record<string, number>) => void;
  onSortStep: () => void;
  onEnterTrash: () => void;
  onPress: () => void;
}

function SortableCard({
  roadmap,
  id,
  initialOrder,
  positions,
  draggedAbsoluteX,
  draggedAbsoluteY,
  trashRef,
  isOverTrash,
  onDragStart,
  onDragEnd,
  onSortStep,
  onEnterTrash,
  onPress,
}: SortableCardProps) {
  const { colorScheme } = useColorScheme();
  const pct = getCompletionPercent(roadmap?.nodes);

  const initialY = initialOrder * ITEM_HEIGHT;
  const translateY = useSharedValue(initialY);
  const isDragging = useSharedValue(false);
  const startIndex = useSharedValue(0);
  // Track previous hovered slot to avoid repeated haptics
  const lastHoverIndex = useSharedValue(-1);
  // Track whether we were over trash last frame to fire "enter" haptic once
  const wasOverTrash = useSharedValue(false);

  useAnimatedReaction(
    () => positions.value[id],
    (newOrder, prevOrder) => {
      if (newOrder !== undefined && newOrder !== prevOrder && !isDragging.value) {
        translateY.value = withTiming(newOrder * ITEM_HEIGHT, { duration: 150 });
      }
    }
  );

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart(() => {
      isDragging.value = true;
      startIndex.value = positions.value[id];
      lastHoverIndex.value = positions.value[id];
      wasOverTrash.value = false;
      runOnJS(onDragStart)(id);
    })
    .onUpdate((e) => {
      const originY = startIndex.value * ITEM_HEIGHT;
      translateY.value = originY + e.translationY;
      draggedAbsoluteX.value = e.absoluteX;
      draggedAbsoluteY.value = e.absoluteY;

      // Check if finger is over trash bubble using measure()
      const measurement = measure(trashRef);
      let overTrash = false;
      if (measurement) {
        overTrash =
          e.absoluteX >= measurement.pageX &&
          e.absoluteX <= measurement.pageX + measurement.width &&
          e.absoluteY >= measurement.pageY &&
          e.absoluteY <= measurement.pageY + measurement.height;
      }

      if (overTrash && !wasOverTrash.value) {
        wasOverTrash.value = true;
        isOverTrash.value = true;
        runOnJS(onEnterTrash)();
      } else if (!overTrash && wasOverTrash.value) {
        wasOverTrash.value = false;
        isOverTrash.value = false;
      }

      // Don't rearrange other cards if over trash
      if (overTrash) return;

      const count = Object.keys(positions.value).length;
      const hoverIndex = Math.round((originY + e.translationY) / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(count - 1, hoverIndex));

      if (clampedIndex !== positions.value[id]) {
        const newPositions = { ...positions.value };
        const currentDraggedSlot = newPositions[id];
        const direction = clampedIndex > currentDraggedSlot ? 1 : -1;
        for (const k of Object.keys(newPositions)) {
          if (k === id) continue;
          const slot = newPositions[k];
          if (direction === 1 && slot > currentDraggedSlot && slot <= clampedIndex) {
            newPositions[k] = slot - 1;
          } else if (direction === -1 && slot < currentDraggedSlot && slot >= clampedIndex) {
            newPositions[k] = slot + 1;
          }
        }
        newPositions[id] = clampedIndex;
        positions.value = newPositions;

        // Fire sort haptic only when slot actually changes
        if (clampedIndex !== lastHoverIndex.value) {
          lastHoverIndex.value = clampedIndex;
          runOnJS(onSortStep)();
        }
      }
    })
    .onEnd(() => {
      isDragging.value = false;
      const deleteNow = isOverTrash.value;
      isOverTrash.value = false;
      wasOverTrash.value = false;
      draggedAbsoluteX.value = 0;
      draggedAbsoluteY.value = 0;

      if (deleteNow) {
        runOnJS(onDragEnd)(id, true);
      } else {
        translateY.value = withTiming(positions.value[id] * ITEM_HEIGHT, { duration: 120 });
        runOnJS(onDragEnd)(id, false, positions.value);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: 100,
      transform: [
        { translateY: translateY.value },
        { scale: withSpring(isDragging.value ? 1.05 : 1) },
      ],
      zIndex: isDragging.value ? 999 : 1,
      shadowOpacity: withSpring(isDragging.value ? 0.3 : 0),
      shadowRadius: withSpring(isDragging.value ? 10 : 0),
      shadowOffset: { width: 0, height: isDragging.value ? 5 : 0 },
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle} className="rounded-2xl bg-neoFg dark:bg-neoFgDark mx-5 mb-5 relative">
        <Pressable
          onPress={onPress}
          className="rounded-2xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark px-5 py-4 -translate-x-1.5 -translate-y-1.5 active:translate-x-0 active:translate-y-0 h-full justify-between"
        >
          <View className="flex-row justify-between items-start mb-1">
            <Text
              className="flex-1 text-base font-space-bold uppercase text-neoFg dark:text-neoFgDark mr-4 leading-tight"
              numberOfLines={2}
            >
              {roadmap?.topic || "Untitled Topic"}
            </Text>
            <View className="rounded-full bg-neoFg dark:bg-neoFgDark px-2 py-1">
              <Text className="text-[10px] font-space-bold text-neoBg dark:text-neoBgDark">
                {pct}%
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] font-mono font-medium text-neoFg/60 dark:text-neoFgDark/60">
              {getRelativeTime(roadmap.createdAt).toUpperCase()}
            </Text>

            <View className="flex-row items-center">
              <View className="h-2 w-24 overflow-hidden rounded-full border border-neoFg/30 dark:border-neoFgDark/30 bg-neoBg dark:bg-neoBgDark">
                <View
                  className="h-full bg-neoFg dark:bg-neoFgDark"
                  style={{ width: `${pct}%` }}
                />
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const roadmaps = useRoadmapStore((s) => s.roadmaps);
  const deleteRoadmap = useRoadmapStore((s) => s.deleteRoadmap);
  const setRoadmaps = useRoadmapStore((s) => s.setRoadmaps);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const draggedAbsoluteX = useSharedValue(0);
  const draggedAbsoluteY = useSharedValue(0);
  const isOverTrash = useSharedValue(false);
  const trashRef = useAnimatedRef<any>();

  const positions = useSharedValue<Record<string, number>>(
    roadmaps.length > 0
      ? Object.assign({}, ...roadmaps.map((r, i) => ({ [r.id]: i })))
      : {}
  );

  useEffect(() => {
    positions.value =
      roadmaps.length > 0
        ? Object.assign({}, ...roadmaps.map((r, i) => ({ [r.id]: i })))
        : {};
  }, [roadmaps]);

  const handleDragStart = useCallback((id: string) => {
    setActiveDragId(id);
  }, []);

  const handleDragEnd = useCallback(
    (id: string, isDelete: boolean, newPositions?: Record<string, number>) => {
      setActiveDragId(null);
      if (isDelete) {
        hapticDelete();
        deleteRoadmap(id);
      } else if (newPositions) {
        const sorted = [...roadmaps].sort((a, b) => newPositions[a.id] - newPositions[b.id]);
        setRoadmaps(sorted);
      }
    },
    [roadmaps]
  );

  const animatedTrashStyle = useAnimatedStyle(() => {
    const isDragging = activeDragId !== null;
    return {
      opacity: withSpring(isDragging ? 1 : 0),
      transform: [
        { scale: withSpring(isDragging ? (isOverTrash.value ? 1.35 : 1) : 0.5) },
        { translateY: withSpring(isDragging ? 0 : 40) },
      ],
      backgroundColor: withTiming(isOverTrash.value ? "#ef4444" : isDark ? "#1e293b" : "#0f172a", {
        duration: 100,
      }),
    };
  });

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-neoBg dark:bg-neoBgDark">
      <View className="pt-3 px-5 pb-5 flex-row items-center">
        <Text className="text-xl font-space-bold tracking-tight text-neoFg dark:text-neoFgDark">
          Learning Paths
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        scrollEnabled={activeDragId === null}
        contentContainerStyle={{
          height: roadmaps.length > 0 ? roadmaps.length * ITEM_HEIGHT + 40 : undefined,
          flexGrow: 1,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {roadmaps.length === 0 && (
          <View className="mt-16 mx-6 items-center">
            <View className="w-24 h-24 mb-6 rounded-3xl bg-neoFg dark:bg-neoFgDark">
              <View className="w-24 h-24 rounded-3xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark items-center justify-center -translate-x-1 -translate-y-1">
                <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#ffffff" : "#0f172a"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <Circle cx="11" cy="11" r="8" />
                  <Path d="m21 21-4.3-4.3" />
                </Svg>
              </View>
            </View>
            
            <Text className="text-2xl font-space-bold text-neoFg dark:text-neoFgDark mb-2 text-center">
              No Learning Paths
            </Text>
            <Text className="text-sm font-space-medium text-neoFg/60 dark:text-neoFgDark/60 text-center mb-8 px-2 leading-relaxed">
              Your generated roadmaps will appear here. Search for any topic to build your first path.
            </Text>
            
            <View className="rounded-2xl bg-neoFg dark:bg-neoFgDark w-full max-w-[280px]">
              <Pressable
                onPress={() => router.push("/")}
                className="rounded-2xl border-3 border-neoFg dark:border-neoFgDark bg-[#C4B5FD] dark:bg-[#A78BFA] py-4 items-center justify-center -translate-x-1.5 -translate-y-1.5 active:translate-x-0 active:translate-y-0"
              >
                <Text className="font-space-bold text-base text-neoFg dark:text-neoFgDark uppercase tracking-wider">
                  Start Exploring
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={{ position: "relative", flex: 1 }}>
          {roadmaps.map((roadmap, index) => {
            if (!roadmap || !roadmap.id) return null;
            return (
              <SortableCard
                key={roadmap.id}
                id={roadmap.id}
                initialOrder={index}
                roadmap={roadmap}
                positions={positions}
                draggedAbsoluteX={draggedAbsoluteX}
                draggedAbsoluteY={draggedAbsoluteY}
                trashRef={trashRef}
                isOverTrash={isOverTrash}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onSortStep={hapticSort}
                onEnterTrash={hapticEnterTrash}
                onPress={() => {
                  router.push(`/roadmap/${roadmap.id}`);
                }}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Trash Bubble */}
      <Animated.View
        ref={trashRef}
        style={[
          animatedTrashStyle,
          {
            position: "absolute",
            bottom: 40,
            alignSelf: "center",
            width: TRASH_SIZE,
            height: TRASH_SIZE,
            borderRadius: TRASH_SIZE / 2,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 3,
            borderColor: isDark ? "#ffffff" : "#000000",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
            zIndex: 1000,
          },
        ]}
        pointerEvents="none"
      >
        <TrashIcon color="#ffffff" />
      </Animated.View>
    </View>
  );
}
