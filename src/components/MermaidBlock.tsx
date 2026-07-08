import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useColorScheme } from 'nativewind';

interface MermaidBlockProps {
  code: string;
  title?: string;
}

/**
 * Renders a Mermaid.js diagram inside a WebView.
 * Auto-resizes height via postMessage from the injected HTML.
 */
export function MermaidBlock({ code, title }: MermaidBlockProps) {
  const [height, setHeight] = useState(200);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const webViewRef = useRef<WebView>(null);

  const bgColor = isDark ? '#1e293b' : '#ffffff';
  const fgColor = isDark ? '#f8fafc' : '#0f172a';
  const borderColor = isDark ? '#f8fafc' : '#0f172a';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: ${bgColor};
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 16px;
      font-family: -apple-system, sans-serif;
      overflow: hidden;
    }
    #diagram {
      width: 100%;
      overflow-x: auto;
    }
    .mermaid svg {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div id="diagram" class="mermaid">
${code}
  </div>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: '${isDark ? 'dark' : 'default'}',
      securityLevel: 'loose',
      themeVariables: {
        darkMode: ${isDark},
        background: '${bgColor}',
        primaryColor: '${isDark ? '#6366f1' : '#818cf8'}',
        primaryTextColor: '${fgColor}',
        lineColor: '${fgColor}',
      },
    });

    // Report height to React Native after render
    mermaid.run().then(() => {
      setTimeout(() => {
        const h = document.getElementById('diagram').scrollHeight + 32;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: h }));
      }, 300);
    }).catch(() => {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: 100 }));
    });
  </script>
</body>
</html>`;

  const onMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'height' && typeof msg.value === 'number') {
        setHeight(Math.max(msg.value, 100));
      }
    } catch {}
  }, []);

  return (
    <View
      style={{
        marginVertical: 16,
        borderWidth: 3,
        borderColor,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: bgColor,
      }}
    >
      {title && (
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
            {title}
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
        // Prevent WebView from capturing parent scroll
        {...(Platform.OS === 'android' ? { overScrollMode: 'never' as any } : {})}
      />
    </View>
  );
}
