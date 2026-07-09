import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Linking,
  ScrollView,
} from "react-native";
import { useColorScheme } from "nativewind";

interface Source {
  title: string;
  url: string;
}

interface SourcesModalProps {
  visible: boolean;
  onClose: () => void;
  sources: Source[];
}

export function SourcesModal({ visible, onClose, sources }: SourcesModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Modal backdrop */}
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        {/* Container for main card + shadow */}
        <View className="w-full max-w-[360px] relative">
          
          {/* Shadow */}
          <View className="bg-neoFg dark:bg-neoFgDark rounded-2xl absolute inset-0 top-1.5 left-1.5" />

          {/* Main card */}
          <View className="w-full rounded-2xl border-3 border-neoFg dark:border-neoFgDark bg-neoMain dark:bg-neoMainDark p-6">
            
            {/* Tap-to-dismiss Header Container */}
            <Pressable
              onPress={onClose}
              className="flex-row items-start justify-between border-b-2 border-dashed border-neoFg/20 dark:border-neoFgDark/20 pb-4 mb-4 pr-10 active:opacity-85"
            >
              <View className="flex-1">
                <Text className="text-lg font-space-bold text-neoFg dark:text-neoFgDark uppercase tracking-tight">
                  Sources & References
                </Text>
              </View>

              {/* Top-right close cross "×" */}
              <Text className="font-space-bold text-2xl text-neoFg/30 dark:text-neoFgDark/30 absolute top-0 right-1">
                ×
              </Text>
            </Pressable>

            <ScrollView className="max-h-[300px]" showsVerticalScrollIndicator={false}>
              {sources.map((source, index) => (
                <Pressable
                  key={index}
                  onPress={() => Linking.openURL(source.url)}
                  className="mb-4 flex-row items-start py-1 active:opacity-60"
                >
                  <Text className="text-xs font-mono text-neoFg/50 dark:text-neoFgDark/50 mr-2.5 mt-1">
                    {String(index + 1).padStart(2, '0')}.
                  </Text>
                  <View className="flex-1">
                    <Text className="text-sm font-space-bold text-neoFg dark:text-neoFgDark underline decoration-2">
                      {source.title}
                    </Text>
                    <Text className="text-[11px] font-mono text-neoFg/60 dark:text-neoFgDark/60 mt-1" numberOfLines={1}>
                      {source.url}
                    </Text>
                  </View>
                </Pressable>
              ))}

              {sources.length === 0 && (
                <Text className="py-8 text-center font-mono text-xs text-neoFg/40 dark:text-neoFgDark/40">
                  NO SOURCES AVAILABLE.
                </Text>
              )}
            </ScrollView>

          </View>
        </View>
      </View>
    </Modal>
  );
}
