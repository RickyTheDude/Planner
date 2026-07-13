import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useColorScheme } from 'nativewind';

interface GraphBlockProps {
  code: string;
  title?: string;
}

function parseGraphCode(raw: string) {
  const lines = raw.split('\n');
  const data = lines
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Remove common prefixes like 'y =' or 'f(x) ='
      let fn = line.replace(/^(?:y|f\(x\)|[a-z]\([a-z]\))\s*=\s*/i, '');
      return { fn };
    });
  return data;
}

export function GraphBlock({ code, title }: GraphBlockProps) {
  const [height, setHeight] = useState(300);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const webViewRef = useRef<WebView>(null);

  const bgColor = isDark ? '#1e293b' : '#ffffff';
  const fgColor = isDark ? '#ffffff' : '#0f172a';
  const borderColor = isDark ? '#ffffff' : '#0f172a';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  
  const graphData = useMemo(() => parseGraphCode(code), [code]);

  const html = useMemo(() => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <script src="https://unpkg.com/d3@3/d3.min.js"></script>
  <script src="https://unpkg.com/function-plot@1/dist/function-plot.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: ${bgColor};
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px;
      font-family: -apple-system, sans-serif;
      overflow: hidden;
      touch-action: none;
    }
    #diagram {
      width: 100%;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .function-plot text {
      fill: ${fgColor} !important;
    }
    .function-plot .domain, .function-plot .tick line {
      stroke: ${gridColor} !important;
    }
    .function-plot .y.axis line, .function-plot .x.axis line {
      stroke: ${gridColor} !important;
    }
  </style>
</head>
<body>
  <div id="diagram"></div>
  <script>
    window.updateDiagram = async function(data) {
      try {
        const width = window.innerWidth - 32;
        const height = window.innerHeight - 32;
        
        functionPlot({
          target: '#diagram',
          width: width,
          height: height,
          grid: true,
          data: data
        });
        
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: 300 }));
      } catch (err) {
        console.error(err);
      }
    };

    window.onload = function() {
      if (window.updateDiagram) {
        window.updateDiagram(${JSON.stringify(graphData)});
      }
    };
  </script>
</body>
</html>`, [bgColor, fgColor, gridColor, graphData]);



  const onMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'height' && typeof msg.value === 'number') {
        setHeight(Math.max(msg.value, 200));
      }
    } catch {}
  }, []);

  return (
    <View
      style={{
        marginVertical: 16,
        borderWidth: 3,
        borderColor: borderColor,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: bgColor,
      }}
    >
      {(title || graphData.length > 0) && (
        <View
          style={{
            borderBottomWidth: 2,
            borderBottomColor: borderColor,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isDark ? '#6366f1' : '#818cf8',
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: fgColor,
            }}
          >
            {title || `Graph: ${graphData.map(d => d.fn).join(', ')}`}
          </Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={{ height, backgroundColor: bgColor }}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        onMessage={onMessage}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        {...(Platform.OS === 'android' ? { overScrollMode: 'never' as any } : {})}
      />
    </View>
  );
}
