import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withRepeat, 
  withTiming, 
  Easing
} from 'react-native-reanimated';
import { useColorScheme } from "nativewind";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface StandingWaveLoaderProps {
  width?: number;
  height?: number;
  color?: string;
}

export const StandingWaveLoader: React.FC<StandingWaveLoaderProps> = ({ 
  width = 150, 
  height = 30,
  color
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // neoCyan by default
  const defaultColor = isDark ? '#6366f1' : '#818cf8'; 
  const waveColor = color || defaultColor;

  const time = useSharedValue(0);

  useEffect(() => {
    // Loop time from 0 to 2*PI continuously
    time.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: 1200, 
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [time]);

  const animatedProps = useAnimatedProps(() => {
    const amplitude = height / 2 - 2; 
    const nodes = 3; // 3 half-waves across the width
    const points = 50; // Curve resolution
    const k = (Math.PI * nodes) / width; 
    
    // Construct SVG path string for standing wave
    let d = `M 0 ${height / 2}`;
    
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      // y = A * sin(kx) * sin(wt)
      const y = (height / 2) + amplitude * Math.sin(k * x) * Math.sin(time.value);
      d += ` L ${x} ${y}`;
    }

    return {
      d,
    };
  });

  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={width} height={height}>
        <AnimatedPath
          animatedProps={animatedProps}
          fill="none"
          stroke={waveColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};
