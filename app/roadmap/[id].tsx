import React from "react";
import { View, Text, ScrollView, Pressable, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useRoadmapStore } from "../../src/store/useRoadmapStore";

export default function RoadmapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const roadmap = useRoadmapStore((s) => s.getRoadmapById(id ?? ""));
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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

  return (
    <>
      <Stack.Screen options={{ title: roadmap.topic }} />
      <ScrollView
        className="flex-1 bg-neoBg dark:bg-neoBgDark"
        contentContainerStyle={{ paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress summary */}
        <View className="w-full px-6 mb-8">
          <View className="rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark p-4">
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

        {/* Timeline Path */}
        <View className="w-full px-4">
          {roadmap.nodes.map((node, i) => {
            const isCompleted = node.isCompleted;
            const isCurrent = !isCompleted && roadmap.nodes.findIndex((n) => !n.isCompleted) === i;

            // Minimalist neobrutalist colors (stark white/beige/black instead of rainbow)
            const badgeBg = isCompleted
              ? "bg-neoFg dark:bg-neoFgDark"
              : isCurrent
              ? "bg-neoMain dark:bg-neoMainDark"
              : "bg-neoBg dark:bg-neoBgDark";

            const badgeText = isCompleted
              ? "text-neoBg dark:text-neoBgDark"
              : "text-neoFg dark:text-neoFgDark";

            const cardBg = isCurrent || isCompleted
              ? "bg-neoMain dark:bg-neoMainDark"
              : "bg-neoBg dark:bg-neoBgDark opacity-80";

            return (
              <View key={node.id} className="flex-row w-full">
                {/* Timeline Left Column */}
                <View className="w-16 items-center">
                  {/* Top line segment */}
                  <View className={`w-1.5 flex-1 bg-neoFg dark:bg-neoFgDark ${i === 0 ? 'opacity-0' : ''}`} />
                  
                  {/* Badge */}
                  <View className={`w-10 h-10 rounded-xl border-3 border-neoFg dark:border-neoFgDark items-center justify-center z-10 ${badgeBg}`}>
                    {isCompleted ? (
                      <Text className={`font-space-bold ${badgeText}`}>✓</Text>
                    ) : (
                      <Text className={`font-space-bold ${badgeText}`}>
                        {String(i + 1).padStart(2, '0')}
                      </Text>
                    )}
                  </View>

                  {/* Bottom line segment */}
                  <View className={`w-1.5 flex-1 bg-neoFg dark:bg-neoFgDark ${i === totalCount - 1 ? 'opacity-0' : ''}`} />
                </View>

                {/* Right Card Column */}
                <View className="flex-1 pr-2 py-3">
                  {/* 3D solid shadow container */}
                  <View className="w-full bg-neoFg dark:bg-neoFgDark rounded-2xl">
                    <Pressable
                      onPress={() => router.push(`/material/${roadmap.id}/${node.id}`)}
                      disabled={!isCompleted && !isCurrent}
                      className={`rounded-2xl border-3 border-neoFg dark:border-neoFgDark p-5 -translate-x-1.5 -translate-y-1.5 ${
                        !isCompleted && !isCurrent ? "" : "active:translate-x-0 active:translate-y-0"
                      } ${cardBg}`}
                    >
                      <Text className="text-base font-space-bold uppercase text-neoFg dark:text-neoFgDark tracking-tight leading-tight mb-3">
                        {node.label}
                      </Text>
                      
                      <View className="flex-row items-center justify-between border-t-2 border-dashed border-neoFg/20 pt-3">
                        <Text className="text-[10px] font-mono text-neoFg/70 dark:text-neoFgDark/70">
                          {isCompleted ? "✓ COMPLETE" : isCurrent ? "● ACTIVE" : "✕ LOCKED"}
                        </Text>
                        <Text className={`text-[11px] font-space-bold uppercase tracking-wider ${
                          !isCompleted && !isCurrent ? "text-neoFg/40 dark:text-neoFgDark/40" : "text-neoFg dark:text-neoFgDark"
                        }`}>
                          {!isCompleted && !isCurrent ? "Locked" : "Start →"}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}
