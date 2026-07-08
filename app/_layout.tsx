// @ts-ignore
import "../global.css";
import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useRoadmapStore } from "../src/store/useRoadmapStore";
import {
  useFonts,
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const theme = useRoadmapStore((s) => s.theme ?? "light");
  const isDark = colorScheme === "dark";

  React.useEffect(() => {
    setColorScheme(theme);
  }, [theme]);

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const bgColor = isDark ? "#000000" : "#ffffff";
  const fgColor = isDark ? "#e8e8e8" : "#111111";

  const headerOptions = {
    headerShown: true,
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
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: bgColor },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen
          name="roadmap/[id]"
          options={{
            ...headerOptions,
          }}
        />
        <Stack.Screen
          name="material/[roadmapId]/[nodeId]"
          options={{
            ...headerOptions,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
