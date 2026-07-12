import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useLocalSearchParams, useRouter, Stack, useNavigation } from "expo-router";
import { useRoadmapStore } from "../../src/store/useRoadmapStore";

export default function RoadmapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const roadmap = useRoadmapStore((s) => s.getRoadmapById(id ?? ""));
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const isNavigatingRef = useRef(false);

  // Intercept back actions (hardware Android back & default native header back button)
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      const actionType = e.data.action.type;
      if (actionType === "GO_BACK" || actionType === "POP") {
        if (isNavigatingRef.current) {
          return;
        }
        e.preventDefault();
        isNavigatingRef.current = true;
        router.dismissAll();
      }
    });
    return unsubscribe;
  }, [navigation, router]);

  if (!roadmap) {
    return (
      <View className="flex-1 items-center justify-center bg-neoBg dark:bg-neoBgDark">
        <Text className="text-base font-mono text-neoFg/60 dark:text-neoFgDark/60">ROADMAP NOT FOUND</Text>
      </View>
    );
  }

  const completedCount = roadmap.nodes.filter((n) => n.isCompleted).length;
  const totalCount = roadmap.nodes.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const firstIncompleteIndex = roadmap.nodes.findIndex((n) => !n.isCompleted);

  return (
    <>
      <Stack.Screen
        options={{
          title: roadmap.topic,
        }}
      />
      <ScrollView
        className="flex-1 bg-neoBg dark:bg-neoBgDark"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Progress summary ─── */}
        <View className="w-full px-5 pt-6 mb-6">
          <View className="rounded-xl bg-neoFg dark:bg-neoFgDark">
            <View className="rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark p-4 -translate-x-1 -translate-y-1">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-space-bold uppercase tracking-wider text-neoFg dark:text-neoFgDark">
                  Progress
                </Text>
                <View className="rounded border-2 border-neoFg dark:border-neoFgDark bg-neoBg dark:bg-neoBgDark px-2 py-0.5">
                  <Text className="text-[10px] font-space-bold text-neoFg dark:text-neoFgDark">
                    {completedCount}/{totalCount} MODULES · {progressPct}%
                  </Text>
                </View>
              </View>
              <View className="h-6 w-full overflow-hidden rounded border-3 border-neoFg dark:border-neoFgDark bg-neoBg dark:bg-neoBgDark">
                <View
                  className="h-full bg-neoFg dark:bg-neoFgDark"
                  style={{ width: `${progressPct}%` }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ─── Module Cards ─── */}
        {roadmap.nodes.map((node, i) => {
          const isCompleted = node.isCompleted;
          const isCurrent = !isCompleted && firstIncompleteIndex === i;
          const isLocked = !isCompleted && !isCurrent;
          const progress = Math.max(0, Math.min(1, node.maxScrollProgress || 0));

          // State-based card background colors
          const cardBgClass = isCompleted
            ? "bg-[#6EE7B7] dark:bg-[#065F46]"     // mint green / dark emerald
            : isCurrent
            ? "bg-[#FDE68A] dark:bg-[#92400E]"      // warm yellow / dark amber
            : "bg-neoMain dark:bg-neoMainDark";       // white / dark grey

          const statusText = isCompleted
            ? "✓ COMPLETE"
            : isLocked
            ? "LOCKED"
            : "";

          return (
            <View key={node.id}>
              {/* ─── Vertical Connector ─── */}
              {i > 0 && (
                <View className="items-center" style={{ height: 24 }}>
                  <View
                    className={
                      roadmap.nodes[i - 1].isCompleted
                        ? "bg-neoFg dark:bg-neoFgDark"
                        : "bg-neoFg/20 dark:bg-neoFgDark/20"
                    }
                    style={{ width: 3, height: "100%", borderRadius: 2 }}
                  />
                </View>
              )}

              {/* ─── Card (two-layer shadow technique matching the rest of the app) ─── */}
              <View className="px-5">
                {/* Shadow layer */}
                <View className="rounded-xl bg-neoFg dark:bg-neoFgDark">
                  {/* Card surface — shifted up-left for hard shadow effect */}
                  <Pressable
                    onPress={() => {
                      if (!isLocked) {
                        router.push(`/material/${roadmap.id}/${node.id}`);
                      }
                    }}
                    disabled={isLocked}
                    className={`rounded-xl border-3 border-neoFg dark:border-neoFgDark ${cardBgClass} ${isCurrent ? "px-6 py-5" : "px-4 py-3.5"} -translate-x-1 -translate-y-1 active:translate-x-0 active:translate-y-0 ${isLocked ? "opacity-50" : ""}`}
                  >
                    {/* Top row: number badge + status */}
                    <View className="flex-row items-center justify-between mb-2">
                      {/* Number badge */}
                      <View className="rounded border-2 border-neoFg dark:border-neoFgDark bg-neoFg dark:bg-neoFgDark px-2.5 py-0.5 min-w-[36px] items-center">
                        <Text className="text-xs font-space-bold text-neoBg dark:text-neoBgDark">
                          {isCompleted ? "✓" : String(i + 1).padStart(2, "0")}
                        </Text>
                      </View>

                      {/* Status label */}
                      {statusText ? (
                        <Text
                          className={`text-[10px] font-space-bold uppercase tracking-wider ${
                            isCompleted
                              ? "text-[#065F46] dark:text-[#6EE7B7]"
                              : "text-neoFg/40 dark:text-neoFgDark/40"
                          }`}
                        >
                          {statusText}
                        </Text>
                      ) : null}
                    </View>

                    {/* Title — consistent size, up to 2 lines */}
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      className={`${isCurrent ? "text-lg" : "text-sm"} font-space-bold text-neoFg dark:text-neoFgDark leading-tight`}
                    >
                      {node.label}
                    </Text>

                    {/* Mini brutalist progress bar — active node only */}
                    {isCurrent && (
                      <View className="mt-4">
                        <View className="flex-row items-end justify-between mb-1.5">
                          <Text className="text-[10px] font-space-bold uppercase tracking-wider text-[#92400E] dark:text-[#FDE68A]">
                            Progress
                          </Text>
                          <Text className="text-xl font-space-bold text-[#92400E] dark:text-[#FDE68A] leading-none">
                            {Math.round(progress * 100)}%
                          </Text>
                        </View>
                        <View className="h-2 w-full rounded-sm border-2 border-neoFg dark:border-neoFgDark bg-neoBg/50 dark:bg-neoBgDark/50 overflow-hidden">
                          <View
                            className="h-full bg-neoFg dark:bg-neoFgDark"
                            style={{ width: `${Math.round(progress * 100)}%` }}
                          />
                        </View>
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}

        {/* ─── Estimated time footer ─── */}
        {roadmap.estimatedHours > 0 && (
          <View className="px-6 mt-4 mb-4">
            <Text className="text-center text-[10px] font-mono text-neoFg/40 dark:text-neoFgDark/40 uppercase">
              Estimated: {roadmap.estimatedHours}h total · {roadmap.totalModules} modules
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}
