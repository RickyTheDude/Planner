import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const logoLight = require('../../assets/new_icon.png');
const logoDark = require('../../assets/new_icon_inverted.png');

interface LogoLoaderProps {
  size?: number;
  isDark?: boolean;
}

export function LogoLoader({ size = 120, isDark = false }: LogoLoaderProps) {
  const rotationZ = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Spin it around Z axis (2D spin)
    rotationZ.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    // Pulse effect
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1250, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1250, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotateZ: `${rotationZ.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.Image
        source={isDark ? logoDark : logoLight}
        style={[
          styles.logo,
          { width: size, height: size },
          animatedStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
