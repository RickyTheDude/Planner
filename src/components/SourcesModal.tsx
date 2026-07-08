import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Linking,
  ScrollView,
  useColorScheme,
} from "react-native";

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
  const colorScheme = useColorScheme();
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
        {/* Shadow wrapper */}
        <View className="w-full max-w-[360px] bg-neoFg rounded-2xl">
          {/* Rotated neobrutalist yellow sticky note card */}
          <View
            style={{ transform: [{ rotate: "-1deg" }] }}
            className="w-full rounded-2xl border-3 border-neoFg bg-[#fef08a] p-6 -translate-x-1.5 -translate-y-1.5"
          >
            {/* Masking tape on top */}
            <View
              className="absolute -top-3.5 left-1/2 w-[90px] h-[28px] bg-white/70 border border-black/15 shadow-sm"
              style={{
                transform: [{ translateX: -45 }, { rotate: "1deg" }],
              }}
            />

            {/* Top-right close cross "×" */}
            <Pressable
              onPress={onClose}
              className="absolute top-4 right-4 bg-neoYellow border-2 border-neoFg w-7 h-7 items-center justify-center shadow-[1.5px_1.5px_0px_#111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Text className="font-space-bold text-sm text-neoFg">×</Text>
            </Pressable>

            {/* Modal header */}
            <View className="border-b-2 border-dashed border-black/20 pb-2 mb-4 pr-8">
              <Text className="text-sm font-space-bold text-black/60 uppercase">
                SAY HELLO!
              </Text>
              <Text className="text-lg font-space-bold text-black uppercase tracking-tight">
                Sources & Ref
              </Text>
            </View>

            <ScrollView className="max-h-[300px]" showsVerticalScrollIndicator={false}>
              {sources.map((source, index) => (
                <View key={index} className="mb-3 bg-neoFg rounded-xl">
                  <Pressable
                    onPress={() => Linking.openURL(source.url)}
                    className="flex-row items-center rounded-xl border-2 border-neoFg bg-white px-3.5 py-3 -translate-x-0.5 -translate-y-0.5 active:translate-x-0 active:translate-y-0"
                  >
                    <View className="mr-3 h-8 w-8 items-center justify-center rounded border-2 border-neoFg bg-neoCyan">
                      <Text className="text-sm font-space-bold text-neoFg">↗</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-space-bold text-neoFg" numberOfLines={1}>
                        {source.title.toUpperCase()}
                      </Text>
                      <Text className="mt-0.5 text-[10px] font-mono text-neoFg/60" numberOfLines={1}>
                        {source.url}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              ))}

              {sources.length === 0 && (
                <Text className="py-6 text-center font-mono text-xs text-neoFg/50">
                  NO SOURCES AVAILABLE.
                </Text>
              )}
            </ScrollView>

            {/* Bottom Close Button */}
            <View className="mt-4 bg-neoFg rounded-xl">
              <Pressable
                onPress={onClose}
                className="min-h-[44px] items-center justify-center rounded-xl border-2 border-neoFg bg-neoCyan py-2.5 -translate-x-0.5 -translate-y-0.5 active:translate-x-0 active:translate-y-0"
              >
                <Text className="text-xs font-space-bold uppercase text-neoFg">
                  Close Window
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
