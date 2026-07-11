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
  useWindowDimensions,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useRouter, Redirect } from "expo-router";
import { useRoadmapStore } from "../../src/store/useRoadmapStore";
import { useRoadmapStream } from "../../src/hooks/useRoadmapStream";
import { LoadingOverlay } from "../../src/components/LoadingOverlay";
import { BetaModal } from "../../src/components/BetaModal";
import Svg, { Path, Line, Circle, Rect, Polyline, G, Polygon } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ────────────────────────────────────────────────
// Icon Components (Thin-line detailed style)
// ────────────────────────────────────────────────

const MagnetIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 12V4h-3v8a3 3 0 0 1-6 0V4H6v8a6 6 0 0 0 12 0Z" />
    <Path d="M21 8a9 9 0 0 1-18 0" />
    <Path d="M12 19v3" />
    <Path d="M9 21h6" />
  </Svg>
);

const ImmunologyIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const ThermodynamicsIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
  </Svg>
);

const ChemistryIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
    <Path d="M8.5 2h7" />
    <Path d="M7 16.5h10" />
  </Svg>
);

const GeneticsIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 15c6.667-6 13.333 0 20-6" />
    <Path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
    <Path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
    <Path d="M17 6l-2.5-2.5" />
    <Path d="M14 8l-1-1" />
    <Path d="M7 18l2.5 2.5" />
    <Path d="M3.5 14.5l.5.5" />
    <Path d="M20 9l.5.5" />
    <Path d="M6.5 12.5l1 1" />
    <Path d="M16.5 10l1 1" />
  </Svg>
);

const QuantumIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="2" />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <Path d="M2 12h20" />
  </Svg>
);

const BrainIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-2.5 2.5M9.5 2A4.5 4.5 0 0 0 5 6.5A3.5 3.5 0 0 0 7 13a3.5 3.5 0 0 0-1.5 5A4.5 4.5 0 0 0 9.5 22" />
    <Path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 2.5 2.5M14.5 2A4.5 4.5 0 0 1 19 6.5A3.5 3.5 0 0 1 17 13a3.5 3.5 0 0 1 1.5 5A4.5 4.5 0 0 1 14.5 22" />
    <Path d="M12 8h-2M12 12h-3M12 16h-2" />
    <Path d="M12 8h2M12 12h3M12 16h2" />
  </Svg>
);

const SociologyIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

const EconomicsIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Svg>
);

const CognitiveIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 16v-4" />
    <Path d="M12 8h.01" />
  </Svg>
);

const AnthropologyIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="4" r="2" />
    <Path d="M12 6v6" />
    <Path d="M8 22l4-10 4 10" />
    <Path d="M6 12l6 2 6-2" />
  </Svg>
);

const BehavioralIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

const JavaIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <Path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <Line x1="6" y1="2" x2="6" y2="4" />
    <Line x1="10" y1="2" x2="10" y2="4" />
    <Line x1="14" y1="2" x2="14" y2="4" />
  </Svg>
);

const PythonIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="4 17 10 11 4 5" />
    <Line x1="12" y1="19" x2="20" y2="19" />
  </Svg>
);

const DataAnalyticsIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="18" y1="20" x2="18" y2="10" />
    <Line x1="12" y1="20" x2="12" y2="4" />
    <Line x1="6" y1="20" x2="6" y2="14" />
  </Svg>
);

const CSBasicsIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <Line x1="8" y1="21" x2="16" y2="21" />
    <Line x1="12" y1="17" x2="12" y2="21" />
  </Svg>
);

const AlgorithmsIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2L2 7l10 5 10-5-10-5z" />
    <Path d="M2 17l10 5 10-5" />
    <Path d="M2 12l10 5 10-5" />
  </Svg>
);

const DataScienceIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 12a9 9 0 1 1-6.219-8.56" />
    <Path d="M12 12l5-5" />
    <Circle cx="12" cy="12" r="1" />
  </Svg>
);

const TelescopeIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44" />
    <Path d="m13.56 11.747 4.332-.924" />
    <Path d="m16 21-3.105-6.21" />
    <Path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z" />
    <Path d="m6.158 8.633 1.114 4.456" />
    <Path d="m8 21 3.105-6.21" />
    <Circle cx="12" cy="13" r="2" />
  </Svg>
);

const ActivityIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2" />
  </Svg>
);

const BookIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </Svg>
);

const LibraryIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m16 6 4 14" />
    <Path d="M12 6v14" />
    <Path d="M8 8v12" />
    <Path d="M4 4v16" />
  </Svg>
);

const GlobeIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <Path d="M2 12h20" />
  </Svg>
);

const LandmarkIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="3" x2="21" y1="22" y2="22" />
    <Line x1="6" x2="6" y1="18" y2="11" />
    <Line x1="10" x2="10" y1="18" y2="11" />
    <Line x1="14" x2="14" y1="18" y2="11" />
    <Line x1="18" x2="18" y1="18" y2="11" />
    <Polygon points="12 2 20 7 4 7" />
  </Svg>
);

const LaptopIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
  </Svg>
);

const ShieldIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
  </Svg>
);

const CpuIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect width="16" height="16" x="4" y="4" rx="2" />
    <Rect width="6" height="6" x="9" y="9" rx="1" />
    <Path d="M15 2v2" />
    <Path d="M15 20v2" />
    <Path d="M2 15h2" />
    <Path d="M2 9h2" />
    <Path d="M20 15h2" />
    <Path d="M20 9h2" />
    <Path d="M9 2v2" />
    <Path d="M9 20v2" />
  </Svg>
);


const ArrowRightIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="5" y1="12" x2="19" y2="12" />
    <Polyline points="12 5 19 12 12 19" />
  </Svg>
);

const SearchIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

const DiceIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="2" width="20" height="20" rx="3" ry="3" />
    <Circle cx="8" cy="8" r="1" fill={color} />
    <Circle cx="16" cy="8" r="1" fill={color} />
    <Circle cx="12" cy="12" r="1" fill={color} />
    <Circle cx="8" cy="16" r="1" fill={color} />
    <Circle cx="16" cy="16" r="1" fill={color} />
  </Svg>
);

// ────────────────────────────────────────────────
// Topic Data — grouped by category
// ────────────────────────────────────────────────

type TopicItem = {
  title: string;
  subtitle: string;
  icon: React.FC<{ color: string; size?: number }>;
};

const SCIENCES: TopicItem[] = [
  { title: "EM Waves", subtitle: "Physics", icon: MagnetIcon },
  { title: "Immunology", subtitle: "Biology", icon: ImmunologyIcon },
  { title: "Thermodynamics", subtitle: "Physics", icon: ThermodynamicsIcon },
  { title: "Organic Chemistry", subtitle: "Chemistry", icon: ChemistryIcon },
  { title: "Genetics", subtitle: "Biology", icon: GeneticsIcon },
  { title: "Quantum Mechanics", subtitle: "Physics", icon: QuantumIcon },
  { title: "Astronomy", subtitle: "Space", icon: TelescopeIcon },
  { title: "Classical Mechanics", subtitle: "Physics", icon: ActivityIcon },
  { title: "Anatomy", subtitle: "Biology", icon: ImmunologyIcon },
];

const LIBERAL_ARTS: TopicItem[] = [
  { title: "Psychology", subtitle: "Social Science", icon: BrainIcon },
  { title: "Sociology", subtitle: "Social Science", icon: SociologyIcon },
  { title: "Microeconomics", subtitle: "Economics", icon: EconomicsIcon },
  { title: "Cognitive Science", subtitle: "Psychology", icon: CognitiveIcon },
  { title: "Anthropology", subtitle: "Social Science", icon: AnthropologyIcon },
  { title: "Behavioral Economics", subtitle: "Economics", icon: BehavioralIcon },
  { title: "Philosophy", subtitle: "Humanities", icon: BookIcon },
  { title: "Political Science", subtitle: "Social Science", icon: LandmarkIcon },
  { title: "Literature", subtitle: "Humanities", icon: LibraryIcon },
];

const COMPUTERS: TopicItem[] = [
  { title: "Java", subtitle: "Programming", icon: JavaIcon },
  { title: "Python", subtitle: "Programming", icon: PythonIcon },
  { title: "Data Analytics", subtitle: "Data Science", icon: DataAnalyticsIcon },
  { title: "CS Basics", subtitle: "Fundamentals", icon: CSBasicsIcon },
  { title: "Algorithms & Logic", subtitle: "CS Theory", icon: AlgorithmsIcon },
  { title: "Data Science", subtitle: "Applied CS", icon: DataScienceIcon },
  { title: "Machine Learning", subtitle: "AI", icon: CpuIcon },
  { title: "Cybersecurity", subtitle: "Security", icon: ShieldIcon },
  { title: "Web Development", subtitle: "Engineering", icon: LaptopIcon },
];

// Feeling Lucky pool — all CS/tech topics
const FEELING_LUCKY_POOL = [
  "Java", "Python", "Data Analytics", "Computer Science Basics",
  "Algorithms & Logic", "Data Science", "Machine Learning",
  "Web Development", "Cybersecurity", "Cloud Computing",
  "Artificial Intelligence", "Blockchain", "DevOps",
];

const ALL_TOPICS = [
  // Physics
  "Electromagnetism", "Kinematics", "Thermodynamics", "Optics", "Electrostatics",
  "Newton's Laws of Motion", "Fluid Mechanics", "Gravitation", "Wave Optics",
  "Quantum Mechanics", "Nuclear Physics", "Classical Mechanics",

  // Mathematics
  "Calculus", "Limits & Continuity", "Derivatives", "Integrals", "Differential Equations",
  "Algebra", "Trigonometry", "Coordinate Geometry", "Probability & Statistics",
  "Matrices & Determinants", "Vectors", "Complex Numbers", "Linear Algebra",

  // Chemistry
  "Organic Chemistry", "Chemical Bonding", "Periodic Table", "Stoichiometry",
  "Chemical Kinetics", "Thermodynamics in Chemistry", "Electrochemistry",
  "Inorganic Chemistry", "Biochemistry", "Acids & Bases", "Atomic Structure",

  // Biology
  "Microbiology", "Genetics", "Cell Biology", "Human Anatomy & Physiology",
  "Plant Physiology", "Evolution & Ecology", "Molecular Biology", "Immunology",
  "Biotechnology", "Photosynthesis", "Circulatory System",

  // Social Sciences
  "Psychology", "Sociology", "Cognitive Science", "Anthropology",
  "Microeconomics", "Macroeconomics", "Behavioral Economics", "Social Psychology",

  // CS & Applied Sciences
  "Computer Science Basics", "Algorithms & Logic", "Data Science", "Astronomy & Astrophysics"
];

// ────────────────────────────────────────────────
// Tile Component
// ────────────────────────────────────────────────

const TILE_WIDTH = 148;
const TILE_HEIGHT = 140;

function CourseTile({
  topic,
  isDark,
  onPress,
}: {
  topic: TopicItem;
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <View className="w-[148px] h-[140px] mr-3 rounded-2xl bg-neoFg dark:bg-neoFgDark">
      <Pressable
        onPress={onPress}
        className="w-[148px] h-[140px] rounded-2xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark p-3.5 justify-between -translate-x-1 -translate-y-1 active:translate-x-0 active:translate-y-0"
      >
        <View>
          <topic.icon color={isDark ? "#e8e8e8" : "#0f172a"} size={24} />
        </View>
        <View>
          <Text
            className="font-space-bold text-[15px] leading-tight text-neoFg dark:text-neoFgDark"
            numberOfLines={2}
          >
            {topic.title}
          </Text>
          <Text className="font-space-medium text-[10px] text-neoFg/50 dark:text-neoFgDark/50 mt-0.5">
            @{topic.subtitle}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

// ────────────────────────────────────────────────
// Feeling Lucky Button
// ────────────────────────────────────────────────

function FeelingLuckyCircle({
  isDark,
  onPress,
}: {
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[140px] h-[140px] rounded-full bg-neoFg dark:bg-neoFgDark items-center justify-center mr-5 active:scale-95 opacity-100 active:opacity-80"
    >
      <DiceIcon color={isDark ? "#0f172a" : "#ffffff"} size={28} />
      <Text className="font-space-bold text-[11px] text-neoBg dark:text-neoBgDark mt-2 text-center">
        Feeling{"\n"}Lucky
      </Text>
    </Pressable>
  );
}

// ────────────────────────────────────────────────
// Category Row
// ────────────────────────────────────────────────

function CategoryRow({
  label,
  topics,
  isDark,
  onTopicPress,
  trailingElement,
}: {
  label: string;
  topics: TopicItem[];
  isDark: boolean;
  onTopicPress: (title: string) => void;
  trailingElement?: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 28 }}>
      {/* Section label */}
      <Text
        style={{
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 13,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: isDark ? "rgba(232,232,232,0.45)" : "rgba(15,23,42,0.45)",
          marginBottom: 14,
          paddingLeft: 20,
        }}
      >
        {label}
      </Text>

      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 8, paddingTop: 6, paddingBottom: 6 }}
      >
        {topics.map((topic) => (
          <CourseTile
            key={topic.title}
            topic={topic}
            isDark={isDark}
            onPress={() => onTopicPress(topic.title)}
          />
        ))}
        {trailingElement}
      </ScrollView>
    </View>
  );
}

// ────────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────────

export default function HomeScreen() {
  const [prompt, setPrompt] = useState("");
  const [betaModalVisible, setBetaModalVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const hasSeenOnboarding = useRoadmapStore((s) => s.hasSeenOnboarding);
  const inputRef = useRef<TextInput>(null);

  // ─── Streaming hook ───
  const { generateStructure, isStreaming, error: streamError } = useRoadmapStream();
  const isLoading = isStreaming;

  const activeSuggestions = prompt.trim() && isFocused
    ? ALL_TOPICS.filter(
        (t) =>
          t.toLowerCase().includes(prompt.toLowerCase().trim()) &&
          t.toLowerCase() !== prompt.toLowerCase().trim()
      ).slice(0, 5)
    : [];

  const handleSelectSuggestion = (topic: string) => {
    setPrompt(topic);
    Keyboard.dismiss();
    setIsFocused(false);
    handleSubmitTopic(topic);
  };

  const handleSubmitTopic = async (topicQuery: string, bypassCheck = false) => {
    const trimmed = topicQuery.trim();
    if (!trimmed || isLoading) return;

    // Intercept if the course is already present in history
    const roadmaps = useRoadmapStore.getState().roadmaps;
    const existing = roadmaps.find(
      (r) => r.topic.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing && !bypassCheck) {
      Alert.alert(
        "Resume Course?",
        `You have already started "${existing.topic}". Would you like to resume your progress or reset and start over?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reset Progress",
            style: "destructive",
            onPress: () => {
              useRoadmapStore.getState().deleteRoadmap(existing.id);
              handleSubmitTopic(trimmed, true);
            },
          },
          {
            text: "Resume",
            onPress: () => {
              setPrompt("");
              router.push(`/roadmap/${existing.id}`);
            },
          },
        ]
      );
      return;
    }

    setPrompt(trimmed);
    try {
      const roadmap = await generateStructure(trimmed);
      if (roadmap) {
        setPrompt("");
        router.push(`/roadmap/${roadmap.id}`);
      } else if (streamError) {
        Alert.alert("Generation Failed", streamError);
      }
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
      Alert.alert(
        "Generation Failed",
        "An error occurred while generating your roadmap. Please check your network connection and try again."
      );
    }
  };

  const handleFeelingLucky = () => {
    const randomTopic =
      FEELING_LUCKY_POOL[Math.floor(Math.random() * FEELING_LUCKY_POOL.length)];
    handleSubmitTopic(randomTopic);
  };

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#000000" : "#ffffff",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Header Bar ─── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: insets.top + 12,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <Image
            source={
              isDark
                ? require("../../assets/new_icon_inverted.png")
                : require("../../assets/new_icon.png")
            }
            style={{ width: 30, height: 30 }}
            resizeMode="contain"
          />
          <View
            style={{
              width: 1.5,
              height: 24,
              backgroundColor: isDark
                ? "rgba(232,232,232,0.25)"
                : "rgba(15,23,42,0.25)",
              marginHorizontal: 12,
            }}
          />
          <Text
            style={{
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 20,
              color: isDark ? "#e8e8e8" : "#0f172a",
              letterSpacing: -0.5,
            }}
          >
            Plan & Learn
          </Text>
        </View>

        {/* ─── Search Tile ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View
            style={{
              borderRadius: 18,
              backgroundColor: isDark ? "#e8e8e8" : "#0f172a",
            }}
          >
            <View
              style={{
                borderRadius: 18,
                borderWidth: 3,
                borderColor: isDark ? "#e8e8e8" : "#0f172a",
                backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
                padding: 16,
                transform: [{ translateX: -4 }, { translateY: -4 }],
              }}
            >
              <Text
                style={{
                  fontFamily: "SpaceGrotesk_700Bold",
                  fontSize: 22,
                  color: isDark ? "#e8e8e8" : "#0f172a",
                  marginBottom: 4,
                }}
              >
                Explore
              </Text>
              <Text
                style={{
                  fontFamily: "SpaceGrotesk_400Regular",
                  fontSize: 13,
                  color: isDark
                    ? "rgba(232,232,232,0.5)"
                    : "rgba(15,23,42,0.5)",
                  marginBottom: 14,
                }}
              >
                Search for any topic and generate a roadmap
              </Text>

              {/* Input row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 12,
                  borderWidth: 2.5,
                  borderColor: isDark
                    ? "rgba(232,232,232,0.2)"
                    : "rgba(15,23,42,0.15)",
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(15,23,42,0.03)",
                  paddingHorizontal: 12,
                }}
              >
                <SearchIcon
                  color={
                    isDark
                      ? "rgba(232,232,232,0.4)"
                      : "rgba(15,23,42,0.35)"
                  }
                  size={18}
                />
                <TextInput
                  ref={inputRef}
                  value={prompt}
                  onChangeText={setPrompt}
                  onSubmitEditing={() => handleSubmitTopic(prompt)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsFocused(false), 150);
                  }}
                  placeholder="What do you want to learn?"
                  placeholderTextColor={
                    isDark
                      ? "rgba(232,232,232,0.35)"
                      : "rgba(15,23,42,0.35)"
                  }
                  returnKeyType="search"
                  autoCapitalize="sentences"
                  autoCorrect={false}
                  editable={!isLoading}
                  style={{
                    flex: 1,
                    height: 48,
                    marginLeft: 10,
                    fontSize: 15,
                    fontFamily: "SpaceGrotesk_500Medium",
                    color: isDark ? "#e8e8e8" : "#0f172a",
                  }}
                />

                {/* Submit button */}
                {prompt.trim() ? (
                  <Pressable
                    onPress={() => handleSubmitTopic(prompt)}
                    disabled={isLoading}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: isDark ? "#e8e8e8" : "#0f172a",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ArrowRightIcon
                      color={isDark ? "#0f172a" : "#ffffff"}
                      size={18}
                    />
                  </Pressable>
                ) : null}
              </View>

              {/* Autocomplete suggestions */}
              {activeSuggestions.length > 0 && (
                <View
                  style={{
                    marginTop: 8,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  {activeSuggestions.map((s, index) => (
                    <Pressable
                      key={s}
                      onPress={() => handleSelectSuggestion(s)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 12,
                        paddingHorizontal: 4,
                        borderBottomWidth:
                          index !== activeSuggestions.length - 1 ? 1 : 0,
                        borderBottomColor: isDark
                          ? "rgba(232,232,232,0.08)"
                          : "rgba(15,23,42,0.08)",
                      }}
                    >
                      <ArrowRightIcon
                        color={isDark ? "#666666" : "#999999"}
                        size={14}
                      />
                      <Text
                        style={{
                          marginLeft: 10,
                          fontFamily: "SpaceGrotesk_500Medium",
                          fontSize: 15,
                          color: isDark ? "#e8e8e8" : "#0f172a",
                        }}
                      >
                        {s}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ─── Sciences Row ─── */}
        <CategoryRow
          label="Sciences"
          topics={SCIENCES}
          isDark={isDark}
          onTopicPress={handleSubmitTopic}
        />

        {/* ─── Liberal Arts Row ─── */}
        <CategoryRow
          label="Liberal Arts"
          topics={LIBERAL_ARTS}
          isDark={isDark}
          onTopicPress={handleSubmitTopic}
        />

        {/* ─── Computers Row ─── */}
        <CategoryRow
          label="Computers"
          topics={COMPUTERS}
          isDark={isDark}
          onTopicPress={handleSubmitTopic}
          trailingElement={
            <FeelingLuckyCircle isDark={isDark} onPress={handleFeelingLucky} />
          }
        />
      </ScrollView>

      {isLoading && <LoadingOverlay />}
      <BetaModal
        visible={betaModalVisible}
        onClose={() => setBetaModalVisible(false)}
      />
    </View>
  );
}
