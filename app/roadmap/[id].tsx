import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import Svg, { Circle, Path, Text as SvgText, G, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import { useRoadmapStore } from "../../src/store/useRoadmapStore";

// ─── Layout Constants ───
const VERTICAL_OFFSET = 120;
const PADDING_TOP = 80;
const PADDING_BOTTOM = 80;
const NODE_RADIUS = 26;
const LABEL_MAX_WIDTH = 120;

/**
 * Calculate the position of a node given its index.
 * Produces a zigzag pattern: even indices left, odd indices right.
 */
function getNodePosition(index: number, screenWidth: number) {
  const leftX = screenWidth * 0.28;
  const rightX = screenWidth * 0.72;
  const x = index % 2 === 0 ? leftX : rightX;
  const y = PADDING_TOP + index * VERTICAL_OFFSET;
  return { x, y };
}

/**
 * Generate a cubic Bézier path string between two points.
 */
function getBezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
}

export default function RoadmapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const roadmap = useRoadmapStore((s) => s.getRoadmapById(id ?? ""));
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { width: screenWidth } = useWindowDimensions();

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

  // Pre-calculate all node positions
  const nodePositions = useMemo(
    () => roadmap.nodes.map((_, i) => getNodePosition(i, screenWidth)),
    [roadmap.nodes.length, screenWidth]
  );

  const canvasHeight = totalCount > 0
    ? PADDING_TOP + (totalCount - 1) * VERTICAL_OFFSET + PADDING_BOTTOM
    : 300;

  // Colors
  const fgColor = isDark ? "#f8fafc" : "#0f172a";
  const bgColor = isDark ? "#000000" : "#ffffff";
  const completedFill = isDark ? "#f8fafc" : "#0f172a";
  const completedText = isDark ? "#0f172a" : "#ffffff";
  const currentFill = isDark ? "#d97706" : "#f59e0b";
  const lockedFill = isDark ? "#1e293b" : "#f1f5f9";
  const lockedStroke = isDark ? "#475569" : "#cbd5e1";
  const pathStroke = isDark ? "#334155" : "#d1d5db";
  const completedPathStroke = isDark ? "#94a3b8" : "#64748b";

  return (
    <>
      <Stack.Screen options={{ title: roadmap.topic }} />
      <ScrollView
        className="flex-1 bg-neoBg dark:bg-neoBgDark"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress summary */}
        <View className="w-full px-6 pt-6 mb-2">
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

        {/* SVG Canvas */}
        <View style={{ width: screenWidth, height: canvasHeight }}>
          <Svg width={screenWidth} height={canvasHeight}>
            {/* Bézier connecting paths */}
            {roadmap.nodes.map((node, i) => {
              if (i === totalCount - 1) return null;
              const from = nodePositions[i];
              const to = nodePositions[i + 1];
              const isCompletedPath = node.isCompleted;
              return (
                <Path
                  key={`path-${i}`}
                  d={getBezierPath(from.x, from.y, to.x, to.y)}
                  stroke={isCompletedPath ? completedPathStroke : pathStroke}
                  strokeWidth={3}
                  strokeDasharray={isCompletedPath ? undefined : "8,6"}
                  fill="none"
                />
              );
            })}

            {/* Node circles + labels */}
            {roadmap.nodes.map((node, i) => {
              const { x, y } = nodePositions[i];
              const isCompleted = node.isCompleted;
              const isCurrent = !isCompleted && roadmap.nodes.findIndex((n) => !n.isCompleted) === i;
              const isLocked = !isCompleted && !isCurrent;

              const fill = isCompleted
                ? completedFill
                : isCurrent
                ? currentFill
                : lockedFill;

              const stroke = isLocked ? lockedStroke : fgColor;
              const textFill = isCompleted
                ? completedText
                : isCurrent
                ? fgColor
                : isDark ? "#94a3b8" : "#64748b";

              // Label positioning: alternate left/right of the node
              const labelX = i % 2 === 0 ? x + NODE_RADIUS + 14 : x - NODE_RADIUS - 14;
              const labelAnchor = i % 2 === 0 ? "start" : "end";

              const PROGRESS_RADIUS = NODE_RADIUS + 6;
              const progress = Math.max(0, Math.min(1, node.maxScrollProgress || 0));
              const circumference = 2 * Math.PI * PROGRESS_RADIUS;
              const strokeDashoffset = circumference - (progress * circumference);
              const progressStroke = isDark ? "#10b981" : "#059669"; // Green (neoPink)

              return (
                <G key={node.id}>
                  {/* Outer background ring for current node or nodes with progress */}
                  {(isCurrent || progress > 0) && !isCompleted && (
                    <Circle
                      cx={x}
                      cy={y}
                      r={PROGRESS_RADIUS}
                      fill="none"
                      stroke={isCurrent ? currentFill : (isDark ? "#334155" : "#e2e8f0")}
                      strokeWidth={2}
                      strokeDasharray={progress === 0 ? "4,4" : undefined}
                      opacity={0.4}
                    />
                  )}

                  {/* Progress ring foreground */}
                  {!isCompleted && progress > 0 && (
                    <Circle
                      cx={x}
                      cy={y}
                      r={PROGRESS_RADIUS}
                      fill="none"
                      stroke={progressStroke}
                      strokeWidth={3}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      origin={`${x}, ${y}`}
                      rotation="-90"
                    />
                  )}

                  {/* Node circle */}
                  <Circle
                    cx={x}
                    cy={y}
                    r={NODE_RADIUS}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={3}
                  />

                  {/* Node number / checkmark */}
                  <SvgText
                    x={x}
                    y={y + 1}
                    textAnchor="middle"
                    alignmentBaseline="central"
                    fill={isCompleted ? completedText : textFill}
                    fontSize={isCompleted ? 16 : 13}
                    fontFamily="SpaceGrotesk_700Bold"
                    fontWeight="bold"
                  >
                    {isCompleted ? "✓" : String(i + 1).padStart(2, "0")}
                  </SvgText>

                  {/* Label */}
                  <SvgText
                    x={labelX}
                    y={y - 6}
                    textAnchor={labelAnchor}
                    fill={isLocked ? (isDark ? "#64748b" : "#94a3b8") : fgColor}
                    fontSize={12}
                    fontFamily="SpaceGrotesk_700Bold"
                    fontWeight="bold"
                  >
                    {node.label.length > 18 ? node.label.substring(0, 16) + "…" : node.label}
                  </SvgText>

                  {/* Status subtitle */}
                  <SvgText
                    x={labelX}
                    y={y + 10}
                    textAnchor={labelAnchor}
                    fill={isDark ? "#64748b" : "#94a3b8"}
                    fontSize={9}
                    fontFamily="SpaceGrotesk_400Regular"
                  >
                    {isCompleted ? "COMPLETE" : progress > 0 ? `${Math.round(progress * 100)}% READ` : isCurrent ? "● ACTIVE" : "LOCKED"}
                  </SvgText>
                </G>
              );
            })}
          </Svg>

          {/* Invisible Pressable overlay for tap targets */}
          {roadmap.nodes.map((node, i) => {
            const { x, y } = nodePositions[i];
            const isCompleted = node.isCompleted;
            const isCurrent = !isCompleted && roadmap.nodes.findIndex((n) => !n.isCompleted) === i;
            const isLocked = !isCompleted && !isCurrent;

            return (
              <Pressable
                key={`tap-${node.id}`}
                onPress={() => {
                  if (!isLocked) {
                    router.push(`/material/${roadmap.id}/${node.id}`);
                  }
                }}
                disabled={isLocked}
                style={{
                  position: "absolute",
                  left: x - NODE_RADIUS - 10,
                  top: y - NODE_RADIUS - 10,
                  width: (NODE_RADIUS + 10) * 2,
                  height: (NODE_RADIUS + 10) * 2,
                  borderRadius: NODE_RADIUS + 10,
                }}
              />
            );
          })}
        </View>

        {/* Estimated time footer */}
        {roadmap.estimatedHours > 0 && (
          <View className="px-6 mt-2 mb-4">
            <Text className="text-center text-[10px] font-mono text-neoFg/40 dark:text-neoFgDark/40 uppercase">
              Estimated: {roadmap.estimatedHours}h total · {roadmap.totalModules} modules
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}
