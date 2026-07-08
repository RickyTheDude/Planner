import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
} from "react-native";
import { useColorScheme } from "nativewind";
import Svg, { Path } from "react-native-svg";

interface BetaModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BetaModal({ visible, onClose }: BetaModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="w-full max-w-[340px] relative">
          {/* Neobrutalist Shadow */}
          <View className="bg-neoFg dark:bg-neoFgDark rounded-2xl absolute inset-0 top-2 left-2" />

          {/* Main Card */}
          <View className="w-full rounded-2xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark p-6">
            
            {/* Header / Icon */}
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-neoYellow dark:bg-neoYellowDark border-3 border-neoFg dark:border-neoFgDark items-center justify-center mb-3 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#f8fafc]">
                <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#f8fafc" : "#0f172a"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <Path d="M12 9v4" stroke={isDark ? "#f8fafc" : "#0f172a"} strokeWidth="3" />
                  <Path d="M12 17h.01" stroke={isDark ? "#f8fafc" : "#0f172a"} strokeWidth="3" />
                </Svg>
              </View>
              
              <Text className="text-xs font-space-bold text-neoFg/60 dark:text-neoFgDark/60 uppercase tracking-widest">
                System Beta Notice
              </Text>
              <Text className="text-xl font-space-bold text-neoFg dark:text-neoFgDark text-center uppercase tracking-tight mt-1">
                Custom generation restricted
              </Text>
            </View>

            {/* Content Body */}
            <Text className="text-sm font-space text-neoFg/80 dark:text-neoFgDark/80 text-center leading-5 mb-6">
              To keep server bandwidth fast and completely free for students, custom roadmap generation is restricted during our initial beta phase.{"\n\n"}
              Please choose from the curated STEM paths on the home screen!
            </Text>

            {/* Action button */}
            <View className="bg-neoFg dark:bg-neoFgDark rounded-xl">
              <Pressable
                onPress={onClose}
                className="w-full py-3.5 items-center justify-center rounded-xl border-3 border-neoFg dark:border-neoFgDark bg-neoPink dark:bg-neoPinkDark -translate-x-1 -translate-y-1 active:translate-x-0 active:translate-y-0"
              >
                <Text className="font-space-bold text-base text-neoFg dark:text-neoFgDark uppercase tracking-wider">
                  Let's Study!
                </Text>
              </Pressable>
            </View>

          </View>
        </View>
      </View>
    </Modal>
  );
}
