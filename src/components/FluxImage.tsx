import React, { useState, useEffect } from "react";
import { View, Image, ActivityIndicator, Text } from "react-native";
import { generateFluxImage, resolveImageUrl } from "../services/imageService";

interface FluxImageProps {
  query: string;
  alt: string;
}

export function FluxImage({ query, alt }: FluxImageProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      setIsLoading(true);
      try {
        // Lazy load the image from the Vercel backend (FLUX model)
        const uri = await generateFluxImage(query);
        if (isMounted) {
          setImageUri(uri);
        }
      } catch (error) {
        console.error("Failed to load FLUX image:", error);
        if (isMounted) {
          // Fallback to picsum on error
          setImageUri(resolveImageUrl(query));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [query]);

  return (
    <View className="w-full bg-neoMain dark:bg-neoMainDark">
      {isLoading ? (
        <View className="w-full h-[200px] items-center justify-center border-b-2 border-neoFg/10 dark:border-neoFgDark/10">
          <ActivityIndicator size="small" color="#818cf8" />
          <Text className="mt-2 text-[10px] font-mono text-neoFg/40 dark:text-neoFgDark/40 uppercase tracking-widest">
            Generating FLUX Image...
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: imageUri || resolveImageUrl(query) }}
          style={{ width: "100%", height: 200 }}
          resizeMode="cover"
          accessibilityLabel={alt}
        />
      )}
    </View>
  );
}
