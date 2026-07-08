import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, useColorScheme, useWindowDimensions } from "react-native";
import { Drawer } from "expo-router/drawer";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useRouter, useNavigation } from "expo-router";
import { useRoadmapStore } from "../../src/store/useRoadmapStore";
import Svg, { Line, Path } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HamburgerIcon = ({ color }: { color: string }) => (
  <Svg width="18" height="14" viewBox="0 0 24 18" fill="none">
    <Line x1="0" y1="3" x2="24" y2="3" stroke={color} strokeWidth="4.5" />
    <Line x1="0" y1="15" x2="16" y2="15" stroke={color} strokeWidth="4.5" />
  </Svg>
);

const TrashIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18" />
    <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </Svg>
);

const CustomHeaderLeft = () => {
  const navigation = useNavigation() as any;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const fgColor = isDark ? "#f8fafc" : "#0f172a";

  return (
    <View className="ml-4 rounded-lg bg-neoFg dark:bg-neoFgDark">
      <Pressable
        onPress={() => navigation.toggleDrawer()}
        className="h-10 w-10 items-center justify-center rounded-lg border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark -translate-x-1 -translate-y-1 active:translate-x-0 active:translate-y-0"
      >
        <HamburgerIcon color={fgColor} />
      </Pressable>
    </View>
  );
};

function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function getCompletionPercent(nodes: { isCompleted: boolean }[]): number {
  if (nodes.length === 0) return 0;
  const completed = nodes.filter((n) => n.isCompleted).length;
  return Math.round((completed / nodes.length) * 100);
}

interface DraggableRoadmapCardProps {
  roadmap: any;
  index: number;
  draggedAbsoluteY: Animated.SharedValue<number>;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, translateX: number, translateY: number, absoluteY: number) => void;
  onPress: () => void;
  onLongPress: () => void;
}

function DraggableRoadmapCard({
  roadmap,
  index,
  draggedAbsoluteY,
  onDragStart,
  onDragEnd,
  onPress,
  onLongPress,
}: DraggableRoadmapCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const pct = getCompletionPercent(roadmap.nodes);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(300)
    .onStart(() => {
      isDragging.value = true;
      runOnJS(onDragStart)(roadmap.id);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      draggedAbsoluteY.value = event.absoluteY;
    })
    .onEnd((event) => {
      isDragging.value = false;
      const tx = translateX.value;
      const ty = translateY.value;
      const absY = event.absoluteY;
      
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      draggedAbsoluteY.value = withSpring(0);
      
      runOnJS(onDragEnd)(roadmap.id, tx, ty, absY);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: isDragging.value ? 1.03 : 1 },
      ],
      zIndex: isDragging.value ? 999 : 1,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View className="mb-4 relative" style={{ overflow: "visible" }}>
        {/* Footprint placeholder shown when dragged out */}
        <View 
          className="absolute border-3 border-dashed border-neoFg/30 dark:border-neoFgDark/30 rounded-xl"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        <Animated.View style={animatedStyle} className="rounded-xl bg-neoFg dark:bg-neoFgDark">
          <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            className="rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark px-4 py-3.5 -translate-x-1 -translate-y-1 active:translate-x-0 active:translate-y-0"
          >
            <Text
              className="text-sm font-space-bold uppercase text-neoFg dark:text-neoFgDark"
              numberOfLines={1}
            >
              {roadmap.topic}
            </Text>
            <View className="mt-2.5 flex-row items-center justify-between">
              <Text className="text-[10px] font-mono text-neoFg/60 dark:text-neoFgDark/60">
                {getRelativeTime(roadmap.createdAt).toUpperCase()}
              </Text>
              <View className="flex-row items-center">
                <View className="mr-2.5 h-2.5 w-14 overflow-hidden rounded-full border-2 border-neoFg dark:border-neoFgDark bg-neoBg dark:bg-neoBgDark">
                  <View
                    className="h-full bg-neoBg dark:bg-neoBgDark"
                    style={{ width: `${pct}%` }}
                  />
                </View>
                <Text className="text-[10px] font-space-bold text-neoFg dark:text-neoFgDark">{pct}%</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const roadmaps = useRoadmapStore((s) => s.roadmaps);
  const deleteRoadmap = useRoadmapStore((s) => s.deleteRoadmap);
  const setRoadmaps = useRoadmapStore((s) => s.setRoadmaps);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const draggedAbsoluteY = useSharedValue(0);

  const deleteThreshold = screenHeight - insets.bottom - 70;
  const bottomInset = insets.bottom;

  const handleDragStart = (id: string) => {
    setActiveDragId(id);
  };

  const handleDragEnd = (id: string, tx: number, ty: number, absY: number) => {
    setActiveDragId(null);

    if (absY > deleteThreshold) {
      deleteRoadmap(id);
      return;
    }

    const itemHeight = 82;
    const startIndex = roadmaps.findIndex((r) => r.id === id);
    if (startIndex === -1) return;

    const dragOffsetIndex = Math.round(ty / itemHeight);
    let targetIndex = startIndex + dragOffsetIndex;
    targetIndex = Math.max(0, Math.min(roadmaps.length - 1, targetIndex));

    if (targetIndex !== startIndex) {
      const updated = [...roadmaps];
      const [removed] = updated.splice(startIndex, 1);
      updated.splice(targetIndex, 0, removed);
      setRoadmaps(updated);
    }
  };

  const animatedFooterStyle = useAnimatedStyle(() => {
    const isNearDelete = draggedAbsoluteY.value > deleteThreshold;
    return {
      backgroundColor: withSpring(isNearDelete ? "#ef4444" : isDark ? "#0f172a" : "#f8fafc"),
      paddingBottom: withSpring(Math.max(bottomInset, 16) + 12),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const isNearDelete = draggedAbsoluteY.value > deleteThreshold;
    return {
      color: withSpring(isNearDelete ? "#ffffff" : isDark ? "#f8fafc" : "#0f172a"),
    };
  });

  const animatedTrashCircleStyle = useAnimatedStyle(() => {
    const isNearDelete = draggedAbsoluteY.value > deleteThreshold;
    return {
      backgroundColor: withSpring(isNearDelete ? "#ffffff" : isDark ? "#1e293b" : "#0f172a"),
    };
  });

  const animatedNormalIconStyle = useAnimatedStyle(() => {
    const isNearDelete = draggedAbsoluteY.value > deleteThreshold;
    return {
      opacity: withSpring(isNearDelete ? 0 : 1),
    };
  });

  const animatedActiveIconStyle = useAnimatedStyle(() => {
    const isNearDelete = draggedAbsoluteY.value > deleteThreshold;
    return {
      opacity: withSpring(isNearDelete ? 1 : 0),
    };
  });

  return (
    <View style={{ flex: 1, overflow: "visible" }} className="bg-neoBg dark:bg-neoBgDark">
      <View className="border-b-3 border-neoFg dark:border-neoFgDark bg-neoBg dark:bg-neoBgDark px-5 pb-6 pt-14">
        <Text className="text-2xl font-space-bold uppercase tracking-tight text-neoFg dark:text-neoFgDark">
          Cognimosity
        </Text>
        <View className="mt-2 self-start rounded border-2 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark px-2 py-0.5">
          <Text className="text-[10px] font-space-bold uppercase tracking-wider text-neoFg dark:text-neoFgDark">
            LEARNING PATHS
          </Text>
        </View>
      </View>

      <View className="mx-4 mt-5 rounded-xl bg-neoFg dark:bg-neoFgDark">
        <Pressable
          onPress={() => {
            router.push("/");
            props.navigation.closeDrawer();
          }}
          className="rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoYellow dark:bg-neoYellowDark py-3.5 -translate-x-1 -translate-y-1 active:translate-x-0 active:translate-y-0 flex-row items-center justify-center"
        >
          <Text className="mr-2 text-xl font-space-bold text-neoFg dark:text-neoFgDark">+</Text>
          <Text className="text-sm font-space-bold uppercase tracking-wider text-neoFg dark:text-neoFgDark">
            New Roadmap
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        scrollEnabled={activeDragId === null}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {roadmaps.length === 0 && (
          <Text className="mt-8 text-center text-xs font-mono text-neoFg/50 dark:text-neoFgDark/50">
            NO ROADMAPS YET.{"\n"}CREATE YOUR FIRST ONE!
          </Text>
        )}

        {roadmaps.map((roadmap, index) => {
          return (
            <DraggableRoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              index={index}
              draggedAbsoluteY={draggedAbsoluteY}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onPress={() => {
                router.push(`/roadmap/${roadmap.id}`);
                props.navigation.closeDrawer();
              }}
              onLongPress={() => {}}
            />
          );
        })}
      </ScrollView>

      <Animated.View 
        style={animatedFooterStyle} 
        className="border-t-3 border-neoFg dark:border-neoFgDark px-5 py-4 justify-center items-center"
      >
        {activeDragId ? (
          <View className="flex-row items-center justify-center py-1">
            <Animated.View 
              style={animatedTrashCircleStyle} 
              className="h-12 w-12 items-center justify-center rounded-full border-3 border-neoFg shadow-[2px_2px_0px_#f59e0b] relative"
            >
              <Animated.View style={animatedNormalIconStyle} className="items-center justify-center">
                <TrashIcon color="#ffffff" />
              </Animated.View>
              <Animated.View style={animatedActiveIconStyle} className="items-center justify-center absolute">
                <TrashIcon color="#ef4444" />
              </Animated.View>
            </Animated.View>
            <Animated.Text 
              style={animatedTextStyle} 
              className="ml-3 text-xs font-space-bold uppercase"
            >
              Drop here to delete
            </Animated.Text>
          </View>
        ) : (
          <Text className="text-center text-[10px] font-mono text-neoFg/60 dark:text-neoFgDark/60">
            HOLD & DRAG UP/DOWN TO SORT · DRAG TO BOTTOM TO DELETE
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#1a1a1a" : "#ffffff";
  const fgColor = isDark ? "#e8e8e8" : "#111111";

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerLeft: () => null,
        headerStyle: {
          backgroundColor: bgColor,
          borderBottomWidth: 3,
          borderBottomColor: fgColor,
          shadowColor: "transparent",
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: fgColor,
        headerTitleStyle: {
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 18,
          textTransform: "uppercase" as const,
        },
        headerShadowVisible: false,
        drawerStyle: {
          backgroundColor: bgColor,
          width: 300,
          borderRightWidth: 3,
          borderRightColor: fgColor,
          overflow: "visible",
        },
        sceneStyle: { backgroundColor: bgColor },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Roadmaps",
          drawerLabel: "Home",
        }}
      />
    </Drawer>
  );
}
