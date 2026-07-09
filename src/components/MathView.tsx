import React, { useState, useCallback } from 'react';
import { View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useColorScheme } from 'nativewind';

interface MathViewProps {
  /** LaTeX expression WITHOUT outer $$ delimiters */
  expression: string;
}

/**
 * Renders a display-mode LaTeX expression using KaTeX (CDN).
 * Auto-sizes its height via postMessage from the injected HTML page.
 */
export function MathView({ expression }: MathViewProps) {
  const [height, setHeight] = useState(64);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? '#000000' : '#ffffff';
  const fgColor = isDark ? '#f8fafc' : '#0f172a';
  const borderColor = isDark ? 'rgba(248,250,252,0.12)' : 'rgba(15,23,42,0.10)';

  // Safely escape the expression for embedding in a JS template literal
  const safeExpr = expression
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      background: ${bgColor};
      overflow: hidden;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 14px 20px;
      min-height: 100vh;
    }
    #math-output {
      color: ${fgColor};
      max-width: 100%;
      overflow-x: auto;
    }
    /* Force KaTeX text to match theme color */
    .katex, .katex * { color: ${fgColor} !important; }
    .katex svg path { fill: ${fgColor} !important; }
    .katex-display { margin: 0; }
    /* Error state */
    .math-error {
      color: #ef4444;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div id="math-output"></div>
  <script>
    function render() {
      const el = document.getElementById('math-output');
      try {
        katex.render(\`${safeExpr}\`, el, {
          displayMode: true,
          throwOnError: false,
          errorColor: '#ef4444',
          strict: false,
          trust: true,
          output: 'html',
        });
      } catch (err) {
        el.innerHTML = '<span class="math-error">' + (err.message || String(err)) + '</span>';
      }
      // Report rendered height back to React Native
      setTimeout(function() {
        var h = document.body.scrollHeight;
        window.ReactNativeWebView.postMessage(JSON.stringify({ height: h }));
      }, 120);
    }

    // KaTeX is loaded with defer — wait for it
    if (typeof katex !== 'undefined') {
      render();
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        // Poll until katex is defined (CDN async)
        var tries = 0;
        var iv = setInterval(function() {
          tries++;
          if (typeof katex !== 'undefined') {
            clearInterval(iv);
            render();
          } else if (tries > 50) {
            clearInterval(iv);
            document.getElementById('math-output').textContent = \`${safeExpr}\`;
            window.ReactNativeWebView.postMessage(JSON.stringify({ height: 40 }));
          }
        }, 100);
      });
    }
  </script>
</body>
</html>`;

  const onMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (typeof msg.height === 'number' && msg.height > 0) {
        setHeight(Math.max(msg.height, 40));
      }
    } catch {}
  }, []);

  return (
    <View
      style={{
        marginVertical: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor,
        overflow: 'hidden',
        backgroundColor: bgColor,
      }}
    >
      <WebView
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
